// Simple script to check if Cal.com env vars are set
// Run with: node scripts/check-env.js

require('dotenv').config({ path: '.env.local' })

const apiKey = process.env.CALCOM_API_KEY
const oauthClientId = process.env.CALCOM_OAUTH_CLIENT_ID
const oauthClientSecret = process.env.CALCOM_OAUTH_CLIENT_SECRET

console.log('\n=== Cal.com Environment Variables Check ===\n')

if (apiKey) {
  console.log('✅ CALCOM_API_KEY is set')
  console.log(`   Value: ${apiKey.substring(0, 15)}... (${apiKey.length} chars)`)
  console.log(`   Type: ${apiKey.startsWith('cal_live_') ? 'Live' : apiKey.startsWith('cal_') ? 'Test' : 'Unknown'}`)
} else {
  console.log('❌ CALCOM_API_KEY is NOT set')
}

if (oauthClientId && oauthClientSecret) {
  console.log('✅ OAuth credentials are set')
  console.log(`   Client ID: ${oauthClientId.substring(0, 10)}...`)
} else {
  console.log('ℹ️  OAuth credentials are NOT set (optional)')
}

if (!apiKey && !(oauthClientId && oauthClientSecret)) {
  console.log('\n⚠️  WARNING: No Cal.com authentication configured!')
  console.log('   Please set CALCOM_API_KEY in .env.local')
}

console.log('\n==========================================\n')
