
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '') // Remove quotes
        envVars[key] = value
    }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyAndFix() {
    console.log('Verifying database state...')

    // 1. Check Table Tennis Duration
    const { data: sport, error: sportError } = await supabase
        .from('sports')
        .select('id, name, duration_minutes')
        .eq('name', 'table-tennis')
        .single()

    if (sportError) {
        console.error('Error fetching table-tennis sport:', sportError.message)
    } else {
        console.log(`Current Table Tennis duration: ${sport?.duration_minutes} minutes`)
        if (sport?.duration_minutes === 60) {
            console.log('✅ Table Tennis duration is correct (60 mins)')
        } else {
            console.log('❌ Table Tennis duration is INCORRECT (should be 60 mins)')
        }
    }

    // 2. Check participants_count column
    const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('participants_count')
        .limit(1)

    if (bookingError) {
        console.error('Error checking bookings table:', bookingError.message)
        if (bookingError.message.includes('does not exist')) {
            console.log('❌ bookings.participants_count column MISSING')
        } else {
            console.log('⚠️ Could not verify participants_count (likely RLS)')
        }
    } else {
        console.log('✅ bookings table has participants_count column queryable')
    }

    // 3. Check for 120-minute pricing for Social Open Play
    if (sport) {
        const { data: pricing, error: pricingError } = await supabase
            .from('drop_in_pricing')
            .select('price')
            .eq('sport_id', sport.id)
            .eq('duration_minutes', 120)
            .single()

        if (pricingError || !pricing) {
            console.log('❌ Missing 120-minute pricing for Table Tennis (required for Social Open Play)')
            console.log('   Error:', pricingError?.message)
        } else {
            console.log(`✅ Found 120-minute pricing for Table Tennis: $${pricing.price}`)
        }
    }
}

verifyAndFix()
