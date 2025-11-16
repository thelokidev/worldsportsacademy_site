import Stripe from 'stripe'

// Validate Stripe secret key format
function validateStripeKey(key: string | undefined, keyType: 'secret' | 'publishable'): string {
  if (!key) {
    const isVercel = process.env.VERCEL === '1'
    const envHint = isVercel
      ? 'Please check your Vercel environment variables and redeploy after updating.'
      : 'Please add it to your .env.local file.'
    
    throw new Error(
      `STRIPE${keyType === 'secret' ? '_SECRET' : '_PUBLISHABLE'}_KEY is not set in environment variables. ${envHint}`
    )
  }

  // Trim whitespace (common issue when copying keys)
  const trimmedKey = key.trim()

  // Validate key format
  if (keyType === 'secret' && !trimmedKey.startsWith('sk_')) {
    const isVercel = process.env.VERCEL === '1'
    const envHint = isVercel
      ? 'Please check your Vercel environment variables.'
      : 'Please check your .env.local file.'
    
    throw new Error(
      `Invalid Stripe secret key format. Secret keys should start with 'sk_test_' or 'sk_live_'. ` +
      `Key preview: ${trimmedKey.substring(0, 12)}... ${envHint}`
    )
  }

  if (keyType === 'publishable' && !trimmedKey.startsWith('pk_')) {
    const isVercel = process.env.VERCEL === '1'
    const envHint = isVercel
      ? 'Please check your Vercel environment variables.'
      : 'Please check your .env.local file.'
    
    throw new Error(
      `Invalid Stripe publishable key format. Publishable keys should start with 'pk_test_' or 'pk_live_'. ` +
      `Key preview: ${trimmedKey.substring(0, 12)}... ${envHint}`
    )
  }

  return trimmedKey
}

// Lazy initialization to avoid throwing errors at module load time
let stripeInstance: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = validateStripeKey(process.env.STRIPE_SECRET_KEY, 'secret')
    
    // Log key status for debugging (only first 12 chars for security)
    const keyPreview = secretKey.substring(0, 12)
    const isVercel = process.env.VERCEL === '1'
    
    if (isVercel) {
      console.log(`[Stripe] Initializing client with key: ${keyPreview}... (Vercel environment)`)
    }
    
    try {
      stripeInstance = new Stripe(secretKey, {
        apiVersion: '2024-12-18.acacia',
        typescript: true,
      })
    } catch (error) {
      const envHint = isVercel 
        ? 'Please check your Vercel environment variables and redeploy after updating.'
        : 'Please check your .env.local file and restart the development server.'
      
      throw new Error(
        `Failed to initialize Stripe client: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        `Key preview: ${keyPreview}... ` +
        `Please verify your STRIPE_SECRET_KEY is correct. ${envHint} ` +
        `The key should start with 'sk_test_' (test mode) or 'sk_live_' (live mode).`
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

