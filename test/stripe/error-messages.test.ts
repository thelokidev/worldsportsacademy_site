import { describe, expect, it } from 'vitest'

import { mapStripeErrorToUserMessage } from '@/lib/stripe/error-messages'

describe('mapStripeErrorToUserMessage', () => {
  it('returns friendly message for card_declined', () => {
    expect(mapStripeErrorToUserMessage({ code: 'card_declined' })).toContain('declined')
  })

  it('returns friendly message for insufficient funds', () => {
    expect(mapStripeErrorToUserMessage({ code: 'insufficient_funds' })).toContain('insufficient')
  })

  it('falls back to default message when unknown error provided', () => {
    expect(mapStripeErrorToUserMessage({ code: 'unknown_code' })).toContain('Payment failed')
  })
})

