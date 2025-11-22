'use client'

import { toast as sonnerToast } from 'sonner'

export function useToast() {
  return {
    toast: (props: {
      title?: string
      description?: string
      variant?: 'default' | 'destructive'
      duration?: number
    }) => {
      if (props.variant === 'destructive') {
        sonnerToast.error(props.title || 'Error', {
          description: props.description,
          duration: props.duration
        })
      } else {
        sonnerToast.success(props.title || 'Success', {
          description: props.description,
          duration: props.duration
        })
      }
    },
  }
}
