'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveWaiverSignature } from '@/server/actions/waiver'
import { useToast } from '@/hooks/use-toast'

export function WaiverSync() {
    const { toast } = useToast()

    useEffect(() => {
        const syncWaiver = async () => {
            // Check if we have a pending waiver signature
            const pendingSignature = sessionStorage.getItem('pending_waiver_signature')
            if (!pendingSignature) return

            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) return

                const signature = JSON.parse(pendingSignature)

                const result = await saveWaiverSignature(user.id, signature)

                if (result.success) {
                    sessionStorage.removeItem('pending_waiver_signature')
                    toast({
                        title: 'Waiver Signed',
                        description: 'Your waiver has been successfully recorded.',
                    })
                } else {
                    // If it failed but we have a user, it might be a real error.
                    // But we don't want to spam the user if it's just a network blip or something.
                    // Maybe we leave it in session storage to try again next reload?
                    console.error('Failed to sync waiver:', result.error)
                }
            } catch (error) {
                console.error('Error syncing waiver:', error)
            }
        }

        syncWaiver()
    }, [toast])

    return null
}
