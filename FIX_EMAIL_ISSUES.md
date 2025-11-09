# Fix: Sign-Up Emails Not Being Sent

## 🔍 Root Causes Identified

1. **Email confirmations disabled** in Supabase config (`enable_confirmations = false`)
2. **No SMTP server configured** for production emails
3. **Missing email redirect URL** in sign-up flow

## ✅ Solutions

### For Local Development (Testing)

If you're running Supabase locally (`supabase start`):

1. **Check Inbucket** (Email testing server):
   - Open: http://localhost:54324
   - All sign-up emails will appear here
   - You can view email content and test the flow

2. **Enable email confirmations** in `supabase/config.toml`:
   ```toml
   [auth.email]
   enable_confirmations = true  # Change from false to true
   ```

3. **Restart Supabase**:
   ```bash
   supabase stop
   supabase start
   ```

### For Production (Supabase Cloud)

#### Step 1: Enable Email Confirmations

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Settings** → **Email Auth**
4. Enable: **"Enable email confirmations"** ✅
5. Set **"Confirm email"** toggle to **ON**

#### Step 2: Configure SMTP Server

**Option A: Use Supabase's Built-in Email (Limited)**
- Free tier: Only 3 emails/hour
- May go to spam
- Not recommended for production

**Option B: Configure Custom SMTP (Recommended)**

1. In Supabase Dashboard: **Authentication** → **Settings** → **SMTP Settings**

2. **Using SendGrid** (Recommended):
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: [Your SendGrid API Key]
   Sender Email: noreply@yourdomain.com
   Sender Name: World Sports Academy
   ```

3. **Using AWS SES**:
   ```
   SMTP Host: email-smtp.us-east-1.amazonaws.com
   SMTP Port: 587
   SMTP User: [Your AWS Access Key]
   SMTP Password: [Your AWS Secret Key]
   Sender Email: noreply@yourdomain.com
   Sender Name: World Sports Academy
   ```

4. **Using Mailgun**:
   ```
   SMTP Host: smtp.mailgun.org
   SMTP Port: 587
   SMTP User: [Your Mailgun SMTP Username]
   SMTP Password: [Your Mailgun SMTP Password]
   Sender Email: noreply@yourdomain.com
   Sender Name: World Sports Academy
   ```

#### Step 3: Set Up Email Redirect URL

1. In Supabase Dashboard: **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

#### Step 4: Customize Email Templates (Optional)

1. In Supabase Dashboard: **Authentication** → **Email Templates**
2. Customize the **"Confirm signup"** template
3. Make sure the confirmation link points to: `{{ .ConfirmationURL }}`

## 🧪 Testing

### Local Development:
1. Sign up with a test email
2. Check http://localhost:54324 (Inbucket)
3. Click the confirmation link in the email
4. Verify you can sign in

### Production:
1. Sign up with a real email
2. Check inbox (and spam folder)
3. Click confirmation link
4. Should redirect to `/signin?verified=true`
5. Sign in with your credentials

## 🐛 Troubleshooting

### Emails Still Not Sending?

1. **Check Supabase Logs**:
   - Dashboard → **Logs** → **Auth Logs**
   - Look for email sending errors

2. **Verify SMTP Credentials**:
   - Test SMTP connection in Supabase Dashboard
   - Check if credentials are correct

3. **Check Rate Limits**:
   - Supabase free tier: 3 emails/hour
   - Custom SMTP: Check provider limits

4. **Email Going to Spam?**:
   - Configure SPF/DKIM records for your domain
   - Use a reputable SMTP provider
   - Set up custom domain for sending

5. **Email Confirmations Still Disabled?**:
   - Double-check Dashboard settings
   - Ensure `enable_confirmations = true` in config (for local)

## 📝 Code Changes Made

1. ✅ Updated `server/actions/auth.ts`:
   - Added `emailRedirectTo` option
   - Better error handling
   - Returns confirmation status

2. ✅ Updated `components/features/auth/sign-up-form.tsx`:
   - Better success messages
   - Handles email confirmation requirement

3. ✅ Created `app/auth/callback/route.ts`:
   - Handles email confirmation callback
   - Redirects to sign-in page after verification

## 🚀 Quick Fix Checklist

- [ ] Enable email confirmations in Supabase Dashboard
- [ ] Configure SMTP server (SendGrid/AWS SES/Mailgun)
- [ ] Add redirect URL: `/auth/callback`
- [ ] Test sign-up flow
- [ ] Check spam folder
- [ ] Verify email templates

## 📚 Additional Resources

- [Supabase Email Auth Docs](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase SMTP Setup](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)



