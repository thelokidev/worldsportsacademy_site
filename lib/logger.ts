type LogMeta = Record<string, unknown>

const formatPayload = (meta?: LogMeta) => {
  if (!meta) {
    return ''
  }
  try {
    return JSON.stringify(meta)
  } catch {
    return String(meta)
  }
}

export const logPaymentInfo = (message: string, meta?: LogMeta) => {
  const payload = {
    scope: 'payments',
    message,
    ...meta,
  }
  console.info('[payments]', message, formatPayload(payload))
}

export const logPaymentError = (message: string, error?: unknown, meta?: LogMeta) => {
  const payload = {
    scope: 'payments',
    message,
    error:
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
    ...meta,
  }
  console.error('[payments:error]', message, formatPayload(payload))
}

