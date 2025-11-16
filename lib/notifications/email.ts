import { logPaymentError, logPaymentInfo } from '@/lib/logger'

export type EmailPayload = {
  to: string
  subject: string
  html: string
  text?: string
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export const sendTransactionalEmail = async (payload: EmailPayload) => {
  const apiKey = process.env.RESEND_API_KEY
  const sender = process.env.RESEND_SENDER_EMAIL

  if (!apiKey || !sender) {
    logPaymentInfo('Skipping transactional email (missing Resend config)', {
      to: payload.to,
      subject: payload.subject,
    })
    return { sent: false, reason: 'missing_configuration' } as const
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Resend API error: ${response.status} - ${errorText}`)
    }

    logPaymentInfo('Transactional email sent', {
      to: payload.to,
      subject: payload.subject,
    })

    return { sent: true } as const
  } catch (error) {
    logPaymentError('Failed to send transactional email', error, {
      to: payload.to,
      subject: payload.subject,
    })
    return { sent: false, reason: 'send_failed' } as const
  }
}

export type RefundEmailParams = {
  to: string
  amount: number
  currency: string
  bookingReference: string
  etaMessage?: string
}

export const sendRefundEmail = async ({
  to,
  amount,
  currency,
  bookingReference,
  etaMessage = 'Refunds typically appear within 5-10 business days.',
}: RefundEmailParams) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  })

  const formattedAmount = formatter.format(amount)
  const subject = `Refund initiated for booking ${bookingReference}`
  const text = [
    `Hi,`,
    '',
    `We initiated your refund of ${formattedAmount} for booking ${bookingReference}.`,
    etaMessage,
    '',
    'Thanks,',
    'World Sports Academy team',
  ].join('\n')

  const html = `
    <p>Hi,</p>
    <p>We've initiated your refund of <strong>${formattedAmount}</strong> for booking <strong>${bookingReference}</strong>.</p>
    <p>${etaMessage}</p>
    <p>Thanks,<br />World Sports Academy team</p>
  `

  return sendTransactionalEmail({ to, subject, text, html })
}

