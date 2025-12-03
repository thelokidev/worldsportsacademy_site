# Update Webhook Secret

The webhook secret needs to be updated in your environment variables to match the new value provided.

## Instructions

1.  Open your `.env.local` file (or `.env` if you are using that).
2.  Find the line starting with `STRIPE_WEBHOOK_SECRET=`.
3.  Replace the existing value with the new secret:

    ```env
    STRIPE_WEBHOOK_SECRET=whsec_woqRzJ3Sq6pc6PJkgx8Kys5gS1cHBLvG
    ```

4.  Save the file.
5.  Restart your development server (`npm run dev`) for the changes to take effect.

## Why is this needed?

The webhook secret is used to verify that events sent to your webhook endpoint (`/api/stripe/webhooks`) are actually from Stripe. If the secret doesn't match, all webhook events (like successful payments) will be rejected with a signature verification error.
