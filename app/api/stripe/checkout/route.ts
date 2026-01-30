import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";

export const runtime = "nodejs";

// Helper function to check if profiles table exists
async function checkProfilesTableExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<boolean> {
  try {
    // Try a simple query to see if table exists
    const { error } = await supabase.from("profiles").select("id").limit(1);

    // If error is about table not found, return false
    if (
      error &&
      (error.code === "PGRST205" || error.message.includes("does not exist"))
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Helper function to get or create profile
async function getOrCreateProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | undefined,
  fullName: string | undefined,
) {
  const profilesTableExists = await checkProfilesTableExists(supabase);

  if (!profilesTableExists) {
    console.warn(
      "Profiles table does not exist. Please run the migration: 20250531113526_create_profiles_table.sql",
    );
    return null;
  }

  // Try to get existing profile
  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id, full_name")
    .eq("id", userId)
    .maybeSingle();

  // If profile doesn't exist, try to create it
  if (!profile && !profileError) {
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: fullName || email?.split("@")[0] || null,
      })
      .select("stripe_customer_id, full_name")
      .single();

    if (createError) {
      // If insert fails (e.g., RLS policy), try to get it again (might have been created by trigger)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("stripe_customer_id, full_name")
        .eq("id", userId)
        .maybeSingle();

      profile = existingProfile || null;
    } else {
      profile = newProfile;
    }
  }

  return profile;
}

export async function POST(req: NextRequest) {
  try {
    // Validate Stripe configuration first
    let stripe;
    try {
      stripe = getStripeClient();
    } catch (stripeError) {
      const errorMessage =
        stripeError instanceof Error
          ? stripeError.message
          : "Unknown Stripe error";
      console.error("Stripe configuration error:", errorMessage);
      return NextResponse.json(
        {
          error: "Payment system is not configured. Please contact support.",
          details:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
        },
        { status: 500 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, bookingId, paymentType } = body;

    if (!paymentType || !["membership", "drop_in"].includes(paymentType)) {
      return NextResponse.json(
        { error: "Invalid payment type" },
        { status: 400 },
      );
    }

    // Get or create profile
    const profile = await getOrCreateProfile(
      supabase,
      user.id,
      user.email || undefined,
      user.user_metadata?.full_name || undefined,
    );

    // Get Stripe customer ID from profile, or create new one
    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name:
            profile?.full_name || user.user_metadata?.full_name || undefined,
          metadata: {
            supabase_user_id: user.id,
          },
        });

        customerId = customer.id;

        // Update profile with Stripe customer ID (if profile exists)
        if (profile) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("id", user.id);

          if (updateError) {
            console.error(
              "Failed to update profile with Stripe customer ID:",
              updateError,
            );
            // Continue anyway - we have the customer ID and can proceed with checkout
          }
        } else if (await checkProfilesTableExists(supabase)) {
          // If profile doesn't exist but table exists, try to create it with the Stripe customer ID
          const { error: createWithStripeError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              full_name:
                user.user_metadata?.full_name ||
                user.email?.split("@")[0] ||
                null,
              stripe_customer_id: customerId,
            });

          if (createWithStripeError) {
            console.error(
              "Failed to create profile with Stripe customer ID:",
              createWithStripeError,
            );
            // Continue anyway - checkout can proceed without profile update
          }
        }
      } catch (stripeError) {
        console.error("Failed to create Stripe customer:", stripeError);

        // Extract detailed error information
        let errorMessage =
          "Failed to initialize payment. Please check your Stripe configuration.";
        let errorDetails: string | undefined;

        if (stripeError instanceof Error) {
          errorDetails = stripeError.message;

          // Provide more specific error messages
          if (stripeError.message.includes("Invalid API Key")) {
            errorMessage =
              "Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env.local";
            errorDetails =
              'The Stripe secret key is invalid or not properly configured. Make sure it starts with "sk_test_" (test mode) or "sk_live_" (live mode).';
          } else if (stripeError.message.includes("No such API key")) {
            errorMessage =
              "Stripe API key not found. Please check your STRIPE_SECRET_KEY in .env.local";
            errorDetails =
              "The Stripe secret key is missing or incorrect. Please verify your environment variables.";
          } else if (stripeError.message.includes("Authentication")) {
            errorMessage =
              "Stripe authentication failed. Please verify your API keys.";
            errorDetails = stripeError.message;
          }
        }

        return NextResponse.json(
          {
            error: errorMessage,
            details:
              process.env.NODE_ENV === "development" ? errorDetails : undefined,
          },
          { status: 500 },
        );
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "Failed to create customer account" },
        { status: 500 },
      );
    }

    // Determine app URL: prefer custom domain, then Vercel URL, then localhost
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl && process.env.VERCEL_URL) {
      // Vercel automatically provides VERCEL_URL (e.g., 'your-project.vercel.app')
      appUrl = `https://${process.env.VERCEL_URL}`;
    }
    if (!appUrl) {
      appUrl = "http://localhost:3000";
    }

    if (paymentType === "membership") {
      if (!planId) {
        return NextResponse.json(
          { error: "Plan ID is required for membership checkout" },
          { status: 400 },
        );
      }

      // Get membership plan
      const { data: plan } = await supabase
        .from("membership_plans")
        .select("id, name, price, stripe_price_id")
        .eq("id", planId)
        .single();

      if (!plan) {
        return NextResponse.json(
          { error: "Membership plan not found" },
          { status: 404 },
        );
      }

      if (!plan.stripe_price_id) {
        return NextResponse.json(
          { error: "Stripe price ID not configured for this plan" },
          { status: 500 },
        );
      }

      // Check if user needs to pay initiation fee
      // Promotional period: Free registration until Jan 1, 2026 00:00:00
      const promotionEndDate = new Date("2026-01-01T00:00:00-05:00"); // EST/Ontario time
      const isPromotionActive = new Date() < promotionEndDate;

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("initiation_fee_paid")
        .eq("id", user.id)
        .single();

      // Only charge initiation fee if:
      // 1. User hasn't paid it yet
      // 2. Promotion period has ended (after Jan 1, 2026)
      const needsInitiationFee =
        !userProfile?.initiation_fee_paid && !isPromotionActive;

      // Check if user has an active membership and cancel it if switching plans
      const { data: activeMembership } = await supabase
        .from("memberships")
        .select("id, plan_id, stripe_subscription_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("current_period_end", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // If user has active membership and it's a different plan, cancel it
      if (
        activeMembership &&
        activeMembership.plan_id !== plan.id &&
        activeMembership.stripe_subscription_id
      ) {
        try {
          await handleMembershipUpgradeCancellation({
            supabase,
            stripe,
            membership: activeMembership,
            newPlanId: plan.id,
          });
        } catch (cancelError) {
          console.error(
            "Failed to process membership upgrade cancellation:",
            cancelError,
          );
          const errorMessage =
            cancelError instanceof Error
              ? cancelError.message
              : "Unknown error";
          console.error("Cancellation error details:", errorMessage);
        }
      }

      // Build line items - add initiation fee if needed
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ];

      // Add initiation fee for first-time users
      if (needsInitiationFee) {
        lineItems.push({
          price: "price_1SvJxmDwbguMPSQsDdgst4ib", // Initiation fee price ID
          quantity: 1,
        });
      }

      // Create checkout session for subscription
      let session;
      try {
        session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: "subscription",
          line_items: lineItems,
          currency: "cad",
          success_url: `${appUrl}/dashboard/membership/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/memberships?canceled=true`,
          metadata: {
            user_id: user.id,
            plan_id: plan.id,
            payment_type: "membership",
            includes_initiation_fee: needsInitiationFee.toString(),
          },
          subscription_data: {
            metadata: {
              user_id: user.id,
              plan_id: plan.id,
            },
          },
        });
      } catch (sessionError) {
        console.error(
          "Failed to create Stripe checkout session:",
          sessionError,
        );

        let errorMessage = "Failed to create checkout session";
        let errorDetails: string | undefined;

        if (sessionError instanceof Error) {
          errorDetails = sessionError.message;

          if (sessionError.message.includes("No such price")) {
            errorMessage = `Stripe price ID "${plan.stripe_price_id}" not found. Please check your membership plan configuration.`;
            errorDetails =
              "The Stripe price ID in the database does not exist in your Stripe account. Please verify the price ID in the membership_plans table matches your Stripe products.";
          } else if (sessionError.message.includes("Invalid API Key")) {
            errorMessage =
              "Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env.local";
            errorDetails =
              "The Stripe secret key is invalid or not properly configured.";
          }
        }

        return NextResponse.json(
          {
            error: errorMessage,
            details:
              process.env.NODE_ENV === "development" ? errorDetails : undefined,
          },
          { status: 500 },
        );
      }

      if (!session?.url) {
        return NextResponse.json(
          { error: "Failed to create checkout session URL" },
          { status: 500 },
        );
      }

      return NextResponse.json({ sessionId: session.id, url: session.url });
    } else if (paymentType === "drop_in") {
      if (!bookingId) {
        return NextResponse.json(
          { error: "Booking ID is required for drop-in checkout" },
          { status: 400 },
        );
      }

      // Get booking details
      const { data: booking } = await supabase
        .from("bookings")
        .select(
          `
          id,
          sport_id,
          selected_duration,
          sports: sport_id (
            id,
            name
          )
        `,
        )
        .eq("id", bookingId)
        .single();

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 },
        );
      }

      // Get drop-in pricing with Stripe IDs
      const duration = booking.selected_duration || 60;
      const { data: pricing } = await supabase
        .from("drop_in_pricing")
        .select("price, tax_rate, stripe_price_id, stripe_product_id")
        .eq("sport_id", booking.sport_id)
        .eq("duration_minutes", duration)
        .single();

      if (!pricing) {
        return NextResponse.json(
          { error: "Pricing not found for this sport and duration" },
          { status: 404 },
        );
      }

      if (!pricing.stripe_price_id) {
        return NextResponse.json(
          { error: "Stripe price ID not configured for drop-in pricing" },
          { status: 500 },
        );
      }

      // Drop-in sessions do NOT include initiation fee
      // Initiation fee only applies to membership purchases
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price: pricing.stripe_price_id,
          quantity: 1,
        },
      ];

      // Create checkout session for one-time payment using static price ID
      let session;
      try {
        session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: "payment",
          line_items: lineItems,
          currency: "cad",
          success_url: `${appUrl}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/bookings?canceled=true`,
          metadata: {
            user_id: user.id,
            booking_id: bookingId,
            payment_type: "drop_in",
            sport_id: booking.sport_id,
            duration_minutes: duration.toString(),
            includes_initiation_fee: "false", // Drop-ins never include initiation fee
          },
        });
      } catch (sessionError) {
        console.error(
          "Failed to create Stripe checkout session for drop-in:",
          sessionError,
        );

        let errorMessage = "Failed to create checkout session";
        let errorDetails: string | undefined;

        if (sessionError instanceof Error) {
          errorDetails = sessionError.message;

          if (sessionError.message.includes("No such price")) {
            errorMessage = `Stripe price ID "${pricing.stripe_price_id}" not found. Please check your drop-in pricing configuration.`;
            errorDetails =
              "The Stripe price ID in the database does not exist in your Stripe account. Please verify the price ID in the drop_in_pricing table matches your Stripe products.";
          } else if (sessionError.message.includes("Invalid API Key")) {
            errorMessage =
              "Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env.local";
            errorDetails =
              "The Stripe secret key is invalid or not properly configured.";
          }
        }

        return NextResponse.json(
          {
            error: errorMessage,
            details:
              process.env.NODE_ENV === "development" ? errorDetails : undefined,
          },
          { status: 500 },
        );
      }

      return NextResponse.json({ sessionId: session.id, url: session.url });
    }

    return NextResponse.json(
      { error: "Invalid payment type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}

type SupabaseClientType = Awaited<ReturnType<typeof createClient>>;

async function handleMembershipUpgradeCancellation({
  supabase,
  stripe,
  membership,
  newPlanId,
}: {
  supabase: SupabaseClientType;
  stripe: Stripe;
  membership: { id: string; plan_id: string; stripe_subscription_id: string };
  newPlanId: string;
}) {
  const subscription = await stripe.subscriptions.retrieve(
    membership.stripe_subscription_id,
    {
      expand: ["latest_invoice.payment_intent", "items.data.price"],
    },
  );

  await issueProratedMembershipRefund({
    supabase,
    stripe,
    membership,
    subscription,
    newPlanId,
  });

  await stripe.subscriptions.cancel(membership.stripe_subscription_id);

  const { error: updateError } = await supabase
    .from("memberships")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      cancel_at_period_end: false,
    })
    .eq("id", membership.id);

  if (updateError) {
    console.error(
      "Failed to update membership status after cancellation:",
      updateError,
    );
  }
}

async function issueProratedMembershipRefund({
  supabase,
  stripe,
  membership,
  subscription,
  newPlanId,
}: {
  supabase: SupabaseClientType;
  stripe: Stripe;
  membership: { id: string };
  subscription: Stripe.Subscription;
  newPlanId: string;
}) {
  const price = subscription.items.data[0]?.price;
  if (!price || !price.unit_amount || price.unit_amount <= 0) {
    return;
  }

  const totalSeconds =
    subscription.current_period_end - subscription.current_period_start;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const remainingSeconds = subscription.current_period_end - nowSeconds;

  if (totalSeconds <= 0 || remainingSeconds <= 0) {
    return;
  }

  const proratedAmount = Math.min(
    price.unit_amount,
    Math.floor(
      (price.unit_amount * Math.max(remainingSeconds, 0)) / totalSeconds,
    ),
  );

  if (proratedAmount <= 0) {
    return;
  }

  // Fetch latest membership payment to record refund
  const { data: latestPayment } = await supabase
    .from("payments")
    .select("id, stripe_payment_intent_id")
    .eq("membership_id", membership.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let paymentIntentId: string | null = null;
  const latestInvoice = subscription.latest_invoice;

  if (latestInvoice && typeof latestInvoice !== "string") {
    if (typeof latestInvoice.payment_intent === "string") {
      paymentIntentId = latestInvoice.payment_intent;
    } else if (latestInvoice.payment_intent) {
      paymentIntentId = latestInvoice.payment_intent.id;
    }
  } else if (typeof latestInvoice === "string") {
    // Fallback: retrieve invoice to get payment intent
    try {
      const invoice = await stripe.invoices.retrieve(latestInvoice, {
        expand: ["payment_intent"],
      });
      if (typeof invoice.payment_intent === "string") {
        paymentIntentId = invoice.payment_intent;
      } else if (invoice.payment_intent) {
        paymentIntentId = invoice.payment_intent.id;
      }
    } catch (invoiceError) {
      console.error(
        "Failed to retrieve invoice for membership refund:",
        invoiceError,
      );
    }
  }

  if (!paymentIntentId && latestPayment?.stripe_payment_intent_id) {
    paymentIntentId = latestPayment.stripe_payment_intent_id;
  }

  if (!paymentIntentId) {
    console.warn("Unable to determine payment intent for membership refund.");
    return;
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: proratedAmount,
      reason: "requested_by_customer",
      metadata: {
        reason: "membership_upgrade",
        previous_subscription: subscription.id,
        upgrade_to_plan_id: newPlanId,
      },
    });

    if (latestPayment?.id) {
      const { error: refundRecordError } = await supabase.rpc(
        "fn_create_refund_record",
        {
          p_payment_id: latestPayment.id,
          p_booking_id: null,
          p_stripe_refund_id: refund.id,
          p_amount: (refund.amount || 0) / 100,
          p_status: refund.status,
          p_reason: "membership_upgrade",
          p_metadata: refund.metadata || {},
        },
      );

      if (refundRecordError) {
        console.error(
          "Failed to create refund record for membership upgrade:",
          refundRecordError,
        );
      }
    }
  } catch (refundError) {
    console.error(
      "Failed to issue membership refund during upgrade:",
      refundError,
    );
  }
}
