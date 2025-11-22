'use client'

import { toast } from 'sonner'

export const useToast = () => {
  return {
    toast: (props: {
      title?: string
      description?: string
      variant?: 'default' | 'destructive'
      duration?: number
    }) => {
      if (props.variant === 'destructive') {
        toast.error(props.title || 'Error', {
          description: props.description,
          duration: props.duration
        })
      } else {
        toast.success(props.title || 'Success', {
          description: props.description,
          duration: props.duration
        })
      }
    },
  }
}
