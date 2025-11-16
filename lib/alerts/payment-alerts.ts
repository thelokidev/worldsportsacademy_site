import { logPaymentError, logPaymentInfo } from '@/lib/logger'

type PaymentAlertPayload = {
  title: string
  message: string
  severity?: 'info' | 'warning' | 'critical'
  metadata?: Record<string, unknown>
}

export const sendPaymentAlert = async ({
  title,
  message,
  severity = 'info',
  metadata,
}: PaymentAlertPayload) => {
  const webhookUrl = process.env.PAYMENT_ALERT_WEBHOOK_URL

  if (!webhookUrl) {
    logPaymentInfo('Payment alert (no webhook configured)', {
      title,
      message,
      severity,
      metadata,
    })
    return { sent: false, reason: 'missing_configuration' } as const
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        message,
        severity,
        metadata,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Webhook error: ${response.status} - ${errorText}`)
    }

    logPaymentInfo('Payment alert sent', { title, severity })
    return { sent: true } as const
  } catch (error) {
    logPaymentError('Failed to send payment alert', error, {
      title,
      severity,
    })
    return { sent: false, reason: 'send_failed' } as const
  }
}

