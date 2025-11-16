export type StripeErrorLike = {
  code?: string
  message?: string
  type?: string
}

export const mapStripeErrorToUserMessage = (error?: StripeErrorLike | null) => {
  if (!error) {
    return 'Something went wrong while processing your payment.'
  }

  if (error.code) {
    switch (error.code) {
      case 'card_declined':
        return 'Your card was declined. Please use a different card or contact your bank.'
      case 'insufficient_funds':
        return 'Your card has insufficient funds. Please use a different payment method.'
      case 'authentication_required':
        return 'Additional authentication is required. Please complete the 3D Secure challenge.'
      case 'processing_error':
        return 'Stripe is having trouble processing the payment. Please try again.'
      case 'api_connection_error':
        return 'Network issue detected. Please try again in a moment.'
      default:
        break
    }
  }

  if (error.type === 'StripeCardError' && error.message) {
    return error.message
  }

  if (error.message) {
    return error.message
  }

  return 'Payment failed. Please try again or contact support.'
}

