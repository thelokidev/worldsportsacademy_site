# Email Setup Guide - Fixing Sign-Up Emails

## Problem Identified

Your sign-up emails are not being sent because:

1. **Email confirmations are disabled** in Supabase config
2. **No SMTP server configured** for production
3. **Sign-up flow doesn't request email confirmation**

## Solutions

### Option 1: Local Development (Testing)

If you're using **local Supabase** (`supabase start`), emails are captured by Inbucket:

1. **Access Inbucket**: http://localhost:54324
2. All sign-up emails will appear there
3. You can view and test email templates

### Option 2: Production (Supabase Cloud)

For production, you need to:

#### Step 1: Enable Email Confirmations in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **Authentication** → **Settings** → **Email Auth**
3. Enable: **"Enable email confirmations"**
4. Set **"Confirm email"** to `ON`

#### Step 2: Configure SMTP Server

You have two options:

##### Option A: Use Supabase's Built-in Email (Limited)

- Supabase provides basic email sending
- Limited to 3 emails/hour on free tier
- May go to spam folders
- **Not recommended for production**

##### Option B: Configure Custom SMTP (Recommended)

1. In Supabase Dashboard: **Authentication** → **Settings** → **SMTP Settings**
2. Configure one of these providers:

**Using SendGrid:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Your SendGrid API Key]
Sender Email: noreply@yourdomain.com
Sender Name: World Sports Academy
```

**Using AWS SES:**
```
SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP User: [Your AWS Access Key]
SMTP Password: [Your AWS Secret Key]
Sender Email: noreply@yourdomain.com
Sender Name: World Sports Academy
```

**Using Mailgun:**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Your Mailgun SMTP Username]
SMTP Password: [Your Mailgun SMTP Password]
Sender Email: noreply@yourdomain.com
Sender Name: World Sports Academy
```

#### Step 3: Update Sign-Up Flow

The code needs to handle email confirmation properly. See the updated `server/actions/auth.ts` file.

#### Step 4: Set Up Email Templates (Optional)

1. In Supabase Dashboard: **Authentication** → **Email Templates**
2. Customize:
   - **Confirm signup** template
   - **Magic Link** template
   - **Change Email Address** template
   - **Reset Password** template

### Option 3: Disable Email Confirmation (Quick Fix - Not Recommended)

If you want users to sign up without email verification (for testing only):

1. Keep `enable_confirmations = false` in config
2. Users can sign in immediately after sign-up
3. **Warning**: This is insecure and not recommended for production

## Quick Checklist

- [ ] Check if using local dev (Inbucket at localhost:54324)
- [ ] Enable email confirmations in Supabase Dashboard
- [ ] Configure SMTP server (SendGrid/AWS SES/Mailgun)
- [ ] Test sign-up flow
- [ ] Check spam folder
- [ ] Verify email templates in Supabase Dashboard

## Testing

1. **Local Dev**: Check http://localhost:54324 for emails
2. **Production**: 
   - Sign up with a test email
   - Check inbox (and spam folder)
   - Click confirmation link
   - Verify account is activated

## Common Issues

### Emails Going to Spam
- Configure SPF/DKIM records for your domain
- Use a reputable SMTP provider (SendGrid, AWS SES)
- Set up a custom domain for sending emails

### Rate Limiting
- Supabase free tier: 3 emails/hour
- Upgrade plan or use custom SMTP for higher limits

### Email Not Sending
- Verify SMTP credentials are correct
- Check Supabase logs for errors
- Ensure email confirmations are enabled
- Verify sender email is verified in SMTP provider

## Next Steps

1. Choose your SMTP provider
2. Get API keys/credentials
3. Configure in Supabase Dashboard
4. Test the sign-up flow
5. Monitor email delivery








