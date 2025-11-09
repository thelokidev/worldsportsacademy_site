import Stripe from 'stripe'

// Validate Stripe secret key format
function validateStripeKey(key: string | undefined, keyType: 'secret' | 'publishable'): string {
  if (!key) {
    throw new Error(
      `STRIPE${keyType === 'secret' ? '_SECRET' : '_PUBLISHABLE'}_KEY is not set in environment variables. ` +
      `Please add it to your .env.local file.`
    )
  }

  // Validate key format
  if (keyType === 'secret' && !key.startsWith('sk_')) {
    throw new Error(
      `Invalid Stripe secret key format. Secret keys should start with 'sk_test_' or 'sk_live_'. ` +
      `Please check your STRIPE_SECRET_KEY in .env.local`
    )
  }

  if (keyType === 'publishable' && !key.startsWith('pk_')) {
    throw new Error(
      `Invalid Stripe publishable key format. Publishable keys should start with 'pk_test_' or 'pk_live_'. ` +
      `Please check your NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local`
    )
  }

  return key
}

// Lazy initialization to avoid throwing errors at module load time
let stripeInstance: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = validateStripeKey(process.env.STRIPE_SECRET_KEY, 'secret')
    
    try {
      stripeInstance = new Stripe(secretKey, {
        apiVersion: '2024-12-18.acacia',
        typescript: true,
      })
    } catch (error) {
      throw new Error(
        `Failed to initialize Stripe client: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        `Please verify your STRIPE_SECRET_KEY is correct.`
      )
    }
  }
  
  return stripeInstance
}

// Export stripe getter for backward compatibility
// Note: This will throw at runtime if Stripe is not configured, not at module load time
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

export const getStripePublishableKey = () => {
  return validateStripeKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, 'publishable')
}

