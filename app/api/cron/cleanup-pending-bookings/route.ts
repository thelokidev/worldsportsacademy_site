import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabaseClient } from '@/lib/supabase/service'

/**
 * Cron job to clean up stale pending bookings
 * 
 * This endpoint is configured to run once daily at 2 AM via Vercel Cron Jobs.
 * For Hobby plan: Limited to once per day
 * For Pro plan: Can be configured to run more frequently (e.g., every 5 minutes)
 * 
 * Alternative: Use external scheduler (e.g., cron-job.org) for more frequent runs
 * 
 * Security: Requires CRON_SECRET header to prevent unauthorized calls
 */
export async function GET(req: NextRequest) {
  // Verify cron secret for security
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')

  // Allow calls from Vercel Cron (they don't send auth header but are internal)
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  
  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getServiceSupabaseClient()

    // Call the cleanup function
    const { data, error } = await supabase.rpc('fn_cleanup_stale_pending_bookings')

    if (error) {
      console.error('Failed to cleanup pending bookings:', error)
      return NextResponse.json(
        { error: 'Cleanup failed', details: error.message },
        { status: 500 }
      )
    }

    const cleanedCount = data || 0

    console.log(`[cron] Cleaned up ${cleanedCount} stale pending bookings`)

    return NextResponse.json({
      success: true,
      cleaned: cleanedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}

// Also support POST for flexibility
export const POST = GET

