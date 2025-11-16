import { Buffer } from 'node:buffer'

import { logPaymentError, logPaymentInfo } from '@/lib/logger'

type SmsPayload = {
  to: string
  body: string
}

const getTwilioConfig = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER
  return { accountSid, authToken, fromNumber }
}

export const sendSmsNotification = async ({ to, body }: SmsPayload) => {
  const { accountSid, authToken, fromNumber } = getTwilioConfig()

  if (!accountSid || !authToken || !fromNumber) {
    logPaymentInfo('Skipping SMS (missing Twilio config)', { to, body })
    return { sent: false, reason: 'missing_configuration' } as const
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: to,
        Body: body,
      }).toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Twilio API error: ${response.status} - ${errorText}`)
    }

    logPaymentInfo('SMS sent', { to })
    return { sent: true } as const
  } catch (error) {
    logPaymentError('Failed to send SMS', error, { to })
    return { sent: false, reason: 'send_failed' } as const
  }
}

export type RefundSmsParams = {
  to: string
  amount: number
  currency: string
  etaMessage?: string
}

export const sendRefundSms = async ({
  to,
  amount,
  currency,
  etaMessage = 'Refunds typically appear within 5-10 business days.',
}: RefundSmsParams) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  })

  const body = `World Sports Academy: Refund of ${formatter.format(amount)} initiated. ${etaMessage}`
  return sendSmsNotification({ to, body })
}

