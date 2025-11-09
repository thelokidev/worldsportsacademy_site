# World Sports Academy - Complete User Journey Guide

## 🌐 Website Overview

**World Sports Academy** is a sports facility booking platform where users can:
- Browse sports and facilities
- Purchase memberships for unlimited access
- Book court sessions (either as members or drop-in guests)
- Manage their bookings and memberships
- Admins can manage the entire system

---

## 📍 User Journey Map

### **1. Landing Page (`/`) - First Impression**

**What Users See:**
- **Hero Section**: Large banner with call-to-action buttons
  - "Enroll now" button → Links to `/memberships`
  - "Explore programs" button → Links to `/programs`
- **Sports Section**: Displays available sports (Squash, Table Tennis, Gym, Chess, etc.)
- **Facilities Section**: Shows facility features and amenities
- **Locations Section**: Information about facility locations
- **Footer**: Contact information and navigation links

**Navigation Bar (Always Visible):**
- **Home** (`/`)
- **Programs** (`/programs`)
- **Book Now** (`/bookings`) - Requires authentication
- **Memberships** (`/memberships`)
- **Sign In** button (if not logged in)
- **User Menu** (if logged in) with:
  - Dashboard
  - My Bookings
  - My Membership
  - Sign Out

**User Actions:**
1. Browse the homepage to learn about the academy
2. Click "Explore programs" to see available programs
3. Click "Enroll now" to view membership plans
4. Click "Book Now" to start booking (redirected to sign-in if not authenticated)
5. Click "Sign In" to access their account

---

### **2. Authentication Flow**

#### **2A. Sign Up (`/signup`)**

**What Users See:**
- Registration form with:
  - Email address
  - Password
  - Confirm password
- "Create an account" button
- Link to sign in page (if already have an account)

**User Actions:**
1. Enter email and password
2. Submit form
3. Receive verification email (Supabase Auth)
4. Click verification link in email
5. Redirected to sign-in page with success message

**After Sign Up:**
- User account created in Supabase
- Email verification required before first login
- User can browse public pages but needs to sign in for bookings

#### **2B. Sign In (`/signin`)**

**What Users See:**
- Sign-in form with:
  - Email address
  - Password
- "Sign in" button
- Link to sign-up page (if new user)
- Success message if email was just verified

**User Actions:**
1. Enter email and password
2. Submit form
3. Authenticated via Supabase Auth
4. Redirected to:
   - Original destination (if redirected from protected page)
   - Dashboard (`/dashboard`) by default

**Authentication States:**
- **Not Authenticated**: Can browse public pages, but `/bookings` redirects to sign-in
- **Authenticated**: Full access to all user features
- **Admin**: Additional access to `/admin/*` pages

---

### **3. Programs Page (`/programs`)**

**What Users See:**
- **Hero Section**: "Explore Our Programs" with description
- **Programs Grid**: Cards showing different programs:
  - Program name and description
  - Benefits list
  - "Learn More" button
- **Program Benefits Section**: Highlights of program benefits
- **Call-to-Action Section**: Encourages enrollment

**User Actions:**
1. Browse available programs
2. Click "Learn More" to see program details
3. Navigate to memberships page to enroll
4. Navigate to bookings page to book a session

**Purpose:**
- Inform users about available programs
- Encourage membership enrollment
- Showcase academy offerings

---

### **4. Memberships Page (`/memberships`)**

**What Users See:**
- **Hero Section**: "Choose Your Membership" with description
- **Membership Plans Grid**: Cards showing available plans:
  - Plan name (e.g., "Squash Membership", "Table Tennis Membership")
  - Monthly price
  - Features/benefits list
  - "Purchase Membership" button
- **Drop-in CTA Section**: Information about drop-in rates for non-members

**User Actions:**
1. Browse available membership plans
2. Click "Purchase Membership" on a plan:
   - If not signed in → Redirected to sign-in
   - If signed in → Redirected to Stripe Checkout
3. Complete payment via Stripe
4. Membership activated automatically

**Membership Flow:**
1. User clicks "Purchase Membership"
2. System creates Stripe Checkout session
3. User redirected to Stripe payment page
4. User completes payment
5. Stripe webhook updates membership status in database
6. User redirected to membership dashboard

**Membership Benefits:**
- Unlimited access to booked courts for the selected sport
- No drop-in fees for covered sports
- Auto-renewal monthly subscription
- Cancel anytime (access until end of billing period)

**Special Cases:**
- If user already has active membership → Redirected to `/dashboard/membership`
- If user is not signed in → Redirected to sign-in page

---

### **5. Booking Flow (`/bookings`) - Core Feature**

**⚠️ Authentication Required**: Redirects to `/signin?redirect=/bookings` if not logged in

#### **5A. Booking Page Overview**

**What Users See:**
- **Hero Section**: "Book Your Session" with live availability indicator
- **Progress Bar**: 4-step indicator:
  1. Sport (completed when sport selected)
  2. Court (completed when court selected)
  3. Date (completed when date selected)
  4. Time (completed when time selected)
- **Left Column**: Booking steps interface
- **Right Column**: Booking Summary (updates in real-time)

#### **5B. Step 1: Select Sport**

**What Users See:**
- Grid of available sports:
  - Sport name (e.g., "Squash", "Table Tennis")
  - Sport icon
  - Duration (e.g., "60 min session")
  - "Coming Soon" badge (if sport not available)
- Selected sport highlighted with green border

**User Actions:**
1. Click on a sport card
2. Sport selected → Step 2 (Court selection) appears
3. Courts for selected sport load automatically

**What Happens Behind the Scenes:**
- Fetches available courts for selected sport from database
- Filters out inactive or blocked courts
- Shows loading state while fetching

#### **5C. Step 2: Select Court**

**What Users See:**
- Grid of available courts for selected sport:
  - Court name (e.g., "Court 1", "Court 2")
  - Court location/description
- Selected court highlighted with green border

**User Actions:**
1. Click on a court card
2. Court selected → Step 3 (Date & Time selection) appears
3. Availability for selected court loads (14-day window)

**What Happens Behind the Scenes:**
- Fetches availability for selected court (next 14 days)
- Queries database for existing bookings
- Calculates available time slots based on:
  - Court schedule (open/close times)
  - Existing bookings (conflicts)
  - Past dates (disabled)
- Subscribes to real-time updates (Supabase Realtime)
- Updates availability automatically when bookings change

#### **5D. Step 3: Select Date**

**What Users See:**
- Calendar component (react-day-picker)
- Today's date highlighted
- Past dates disabled
- Dates beyond 14 days disabled
- Selected date highlighted in green

**User Actions:**
1. Click on a date in the calendar
2. Date selected → Time slots for that date appear
3. Booking Summary updates to show selected date

**What Happens Behind the Scenes:**
- Filters available slots for selected date (client-side, instant)
- Updates Booking Summary in real-time
- No database query (already loaded in Step 2)

**Performance Optimizations:**
- Date selection is instant (no lag)
- Pre-computed time labels
- Optimized slot filtering
- React transitions for smooth UI updates

#### **5E. Step 4: Select Time**

**What Users See:**
- **Time Picker Dropdown**: Grouped by time of day:
  - **Morning** (6 AM - 12 PM)
  - **Afternoon** (12 PM - 5 PM)
  - **Evening** (5 PM - 11 PM)
- Available slots marked with checkmark
- Booked slots marked as "(Booked)" and disabled
- Selected time highlighted

**User Actions:**
1. Click on time picker dropdown
2. Select an available time slot
3. Time selected → Booking Summary shows full booking details
4. System checks membership authorization:
   - If member → Shows "Covered by membership"
   - If not member → Shows drop-in pricing with tax

**What Happens Behind the Scenes:**
- Checks user's membership status for selected sport
- Calculates drop-in pricing (if no membership)
- Shows payment requirements in Booking Summary
- Debounced authorization check (300ms) to avoid lag

#### **5F. Booking Summary (Right Column)**

**What Users See (Updates in Real-Time):**
- **Sport**: Selected sport name
- **Court**: Selected court name
- **Date**: Selected date (formatted)
- **Time**: Selected time range (e.g., "2:00 PM - 3:00 PM")
- **Duration**: Session duration (e.g., "60 minutes")

**Payment Information:**
- **If Member**: 
  - Green badge: "Covered by membership"
  - No payment required
- **If Not Member (Drop-in)**:
  - Payment required section
  - Drop-in fee
  - Tax (if applicable)
  - Total amount
  - "Pay & Book" button

**Action Buttons:**
- **Confirm Booking** (members) or **Pay & Book** (drop-ins)
- **Clear All** (reset selection)

#### **5G. Submit Booking**

**User Actions:**
1. Click "Confirm Booking" or "Pay & Book"
2. System validates selection
3. One of two flows:

##### **Flow A: Member Booking (Free)**
1. Booking created directly in database
2. Status: `confirmed`
3. Payment status: `paid` (covered by membership)
4. Success toast notification
5. Redirected to `/dashboard/bookings`

##### **Flow B: Drop-in Booking (Payment Required)**
1. **Create Pending Booking**:
   - Booking created with status: `pending`
   - Payment status: `pending`
   - Booking ID returned
2. **Create Stripe Checkout Session**:
   - Stripe Checkout session created
   - Booking ID linked to session
   - Checkout URL returned
3. **Redirect to Stripe**:
   - User redirected to Stripe payment page
   - User completes payment
4. **Payment Success**:
   - Stripe webhook receives payment confirmation
   - Booking status updated to `confirmed`
   - Payment status updated to `paid`
   - User redirected to `/bookings/success`
5. **Booking Confirmed**:
   - Success page shows confirmation
   - User can view booking in dashboard

**Error Handling:**
- If time slot no longer available → Error message
- If payment fails → Error message, booking remains pending
- If court is blocked → Error message
- If validation fails → Error message with details

---

### **6. Dashboard (`/dashboard`) - User Home**

**What Users See:**
- **Welcome Card**: 
  - Greeting with user email
  - "Book a Court" button
  - "View Memberships" button
- **Upcoming Bookings Card**:
  - List of upcoming bookings (next 5)
  - Booking details (sport, court, date, time)
  - "View All Bookings" link
- **Quick Actions**:
  - Book a court
  - View memberships
  - Manage bookings

**User Actions:**
1. View upcoming bookings
2. Click "Book a Court" → Navigate to `/bookings`
3. Click "View Memberships" → Navigate to `/memberships`
4. Click "View All Bookings" → Navigate to `/dashboard/bookings`

**Purpose:**
- Central hub for user activities
- Quick access to common actions
- Overview of upcoming bookings

---

### **7. My Bookings (`/dashboard/bookings`)**

**What Users See:**
- **Hero Section**: "My Bookings" with description
- **Bookings List**:
  - Each booking shows:
    - Sport name
    - Court name
    - Date (formatted: "Monday, January 15, 2025")
    - Time range (e.g., "2:00 PM - 3:00 PM")
    - Duration (e.g., "60 minutes")
    - Status badge:
      - **Confirmed** (green) - Active booking
      - **Pending** (yellow) - Awaiting payment
      - **Cancelled** (red) - Cancelled booking
    - **Cancel Button** (if booking can be cancelled)
  - Empty state (if no bookings):
    - "You don't have any bookings yet"
    - "Book a Court" button

**User Actions:**
1. View all bookings (past and upcoming)
2. Cancel upcoming booking (if allowed):
   - Click "Cancel" button
   - Confirm cancellation
   - Booking status updated to `cancelled`
   - Court slot becomes available again
3. Navigate back to booking page

**Booking States:**
- **Confirmed**: Active booking, can be cancelled (if not past)
- **Pending**: Awaiting payment, will be confirmed after payment
- **Cancelled**: Cancelled booking, cannot be reactivated
- **Past**: Completed booking, cannot be cancelled

**Cancellation Rules:**
- Can cancel if booking is in the future
- Cannot cancel past bookings
- Cannot cancel already cancelled bookings
- Cancellation frees up the court slot immediately

---

### **8. My Membership (`/dashboard/membership`)**

**What Users See:**

#### **8A. If No Active Membership:**
- **Card**: "No Active Membership"
- Description: "You don't have an active membership"
- "Browse Membership Plans" button → Links to `/memberships`

#### **8B. If Active Membership:**
- **Membership Status Card**:
  - Plan name (e.g., "Squash Membership")
  - Status badge (Active/Cancelled)
  - Renewal date
  - Cancellation notice (if cancelled)
- **Membership Details Card**:
  - Plan name
  - Monthly cost
  - Status
  - Renewal date
  - Cancellation notice (if applicable)
- **Manage Subscription Button**:
  - Links to Stripe Customer Portal
  - User can:
    - Update payment method
    - Cancel subscription
    - View invoice history
    - Update billing information

**User Actions:**
1. View membership details
2. Click "Manage Subscription" → Redirected to Stripe Customer Portal
3. In Stripe Portal:
   - Update payment method
   - Cancel membership (access until end of billing period)
   - View invoices
   - Update billing address
4. Return to website after managing subscription

**Membership States:**
- **Active**: Membership is active, auto-renewing
- **Cancelled**: Membership will cancel at end of billing period
- **Expired**: Membership has expired, no longer active

**Special Cases:**
- If membership is cancelled → Shows cancellation notice
- If membership is expired → Redirected to membership purchase page
- If user has active membership → Redirected from `/memberships` to this page

---

### **9. Booking Success Page (`/bookings/success`)**

**What Users See:**
- **Success Card**:
  - Green checkmark icon
  - "Payment Successful!" title
  - "Your booking has been confirmed" description
  - Confirmation message
  - Action buttons:
    - "View My Bookings" → Links to `/dashboard/bookings`
    - "Book Another" → Links to `/bookings`

**User Actions:**
1. View booking confirmation
2. Click "View My Bookings" → See confirmed booking
3. Click "Book Another" → Start new booking

**What Happens Behind the Scenes:**
- Stripe session ID passed as query parameter
- System confirms payment via API
- Booking status updated to `confirmed`
- Payment status updated to `paid`
- User sees confirmation message

**Error Handling:**
- If session ID invalid → Error message
- If payment confirmation fails → Shows processing message
- User can check bookings page for updates

---

### **10. Admin Dashboard (`/admin/*`) - Admin Only**

**⚠️ Admin Access Required**: Only users with admin role can access

#### **10A. Admin Dashboard (`/admin/dashboard`)**

**What Admins See:**
- **Key Metrics Cards**:
  - Total bookings (all time)
  - Active members
  - Total revenue
  - Recent bookings list
- **Quick Actions**:
  - View all bookings
  - Manage members
  - View revenue

#### **10B. Admin Bookings (`/admin/bookings`)**

**What Admins See:**
- **Bookings List**:
  - All bookings (all users)
  - Filter by status (confirmed, pending, cancelled)
  - Filter by date range
  - Booking details (user, sport, court, date, time, status)
- **Actions**:
  - View booking details
  - Cancel booking (if needed)
  - Filter and search bookings

#### **10C. Admin Members (`/admin/members`)**

**What Admins See:**
- **Members List**:
  - All users with active memberships
  - Member email
  - Membership plan
  - Membership status
  - Renewal date
- **Actions**:
  - View member details
  - View membership history
  - Manage memberships

#### **10D. Admin Revenue (`/admin/revenue`)**

**What Admins See:**
- **Revenue Metrics**:
  - Total revenue
  - Revenue by month
  - Revenue by sport
  - Revenue breakdown (memberships vs drop-ins)
- **Charts and Graphs**:
  - Revenue trends
  - Payment breakdown
  - Membership vs drop-in comparison

#### **10E. Admin Courts (`/admin/courts`)**

**What Admins See:**
- **Courts List**:
  - All courts
  - Court name
  - Court status (active/inactive)
  - Blocked status
  - Associated sports
- **Actions**:
  - Add new court
  - Edit court details
  - Block/unblock court
  - Manage court schedules
  - Set court availability

#### **10F. Admin Memberships (`/admin/memberships`)**

**What Admins See:**
- **Memberships List**:
  - All active memberships
  - Member email
  - Membership plan
  - Status
  - Renewal date
- **Actions**:
  - View membership details
  - Cancel membership
  - Manage membership plans

---

## 🔄 Complete User Flows

### **Flow 1: New User - Browse and Sign Up**

1. User lands on homepage (`/`)
2. Browses sports and facilities
3. Clicks "Explore programs" → Views programs page
4. Clicks "Enroll now" → Views memberships page
5. Clicks "Sign In" → Views sign-in page
6. Clicks "Sign up" → Views sign-up page
7. Enters email and password → Submits form
8. Receives verification email → Clicks verification link
9. Redirected to sign-in page → Signs in
10. Redirected to dashboard → Views welcome message

### **Flow 2: New User - Purchase Membership and Book**

1. User signs up and verifies email
2. Signs in → Redirected to dashboard
3. Clicks "View Memberships" → Views membership plans
4. Selects membership plan → Clicks "Purchase Membership"
5. Redirected to Stripe Checkout → Completes payment
6. Membership activated → Redirected to membership dashboard
7. Clicks "Book a Court" → Views booking page
8. Selects sport → Selects court → Selects date → Selects time
9. Sees "Covered by membership" in summary
10. Clicks "Confirm Booking" → Booking confirmed
11. Redirected to bookings page → Sees confirmed booking

### **Flow 3: Existing User - Book Drop-in Session**

1. User signs in → Views dashboard
2. Clicks "Book a Court" → Views booking page
3. Selects sport → Selects court → Selects date → Selects time
4. Sees drop-in pricing in summary (no membership for this sport)
5. Clicks "Pay & Book" → Pending booking created
6. Redirected to Stripe Checkout → Completes payment
7. Payment confirmed → Redirected to success page
8. Views booking confirmation → Clicks "View My Bookings"
9. Sees confirmed booking in bookings list

### **Flow 4: Existing User - Manage Booking**

1. User signs in → Views dashboard
2. Clicks "View All Bookings" → Views bookings page
3. Sees upcoming booking → Clicks "Cancel" button
4. Confirms cancellation → Booking cancelled
5. Court slot freed up → Booking status updated to "Cancelled"
6. Booking removed from upcoming bookings list

### **Flow 5: Existing User - Manage Membership**

1. User signs in → Views dashboard
2. Clicks "My Membership" → Views membership page
3. Sees active membership details → Clicks "Manage Subscription"
4. Redirected to Stripe Customer Portal
5. Updates payment method → Returns to website
6. Membership updated → Sees updated payment method

### **Flow 6: Admin - Manage System**

1. Admin signs in → Views admin dashboard
2. Views key metrics (bookings, members, revenue)
3. Clicks "Bookings" → Views all bookings
4. Filters bookings by status → Views specific bookings
5. Clicks "Courts" → Views courts list
6. Blocks a court → Court unavailable for booking
7. Clicks "Revenue" → Views revenue analytics
8. Views revenue trends and breakdown

---

## 🎯 Key Features & Interactions

### **Real-time Updates**
- **Court Availability**: Updates automatically when bookings change (Supabase Realtime)
- **Booking Status**: Updates in real-time when payment is processed
- **Membership Status**: Updates when subscription changes

### **Payment Integration**
- **Stripe Checkout**: Secure payment processing for memberships and drop-ins
- **Stripe Webhooks**: Automatic booking confirmation after payment
- **Stripe Customer Portal**: User can manage subscription and payment methods

### **Authorization & Access Control**
- **Public Pages**: Home, Programs, Memberships (browse only)
- **Authenticated Pages**: Bookings, Dashboard, My Bookings, My Membership
- **Admin Pages**: All `/admin/*` routes (admin role required)

### **Performance Optimizations**
- **Instant Date Selection**: Optimized calculations for smooth UI
- **Debounced Authorization Checks**: Prevents lag during time selection
- **Client-side Filtering**: Fast slot filtering without database queries
- **Memoized Calculations**: Reduced re-renders and improved performance

### **Error Handling**
- **Validation Errors**: Clear error messages for invalid inputs
- **Payment Failures**: Graceful error handling with retry options
- **Network Errors**: User-friendly error messages with recovery options
- **Authentication Errors**: Redirects to sign-in with helpful messages

---

## 📱 Responsive Design

- **Desktop**: Full-featured interface with side-by-side layout
- **Tablet**: Optimized layout with responsive grids
- **Mobile**: Mobile-first design with touch-friendly buttons
- **Navigation**: Hamburger menu on mobile, full menu on desktop

---

## 🔐 Security Features

- **Authentication**: Supabase Auth with email verification
- **Authorization**: Role-based access control (user/admin)
- **Payment Security**: Stripe PCI-compliant payment processing
- **Data Protection**: Server-side validation and sanitization
- **Session Management**: Secure session handling with Supabase

---

## 📊 Database Structure

### **Key Tables:**
- **users**: User accounts (managed by Supabase Auth)
- **sports**: Available sports (Squash, Table Tennis, etc.)
- **courts**: Court facilities
- **bookings**: User bookings (sport, court, date, time, status)
- **memberships**: User memberships (plan, status, renewal date)
- **membership_plans**: Available membership plans
- **court_schedules**: Court opening/closing times

### **Relationships:**
- User → Bookings (one-to-many)
- User → Memberships (one-to-many)
- Sport → Courts (one-to-many)
- Court → Bookings (one-to-many)
- Membership Plan → Memberships (one-to-many)

---

## 🎨 User Experience Highlights

1. **Smooth Booking Flow**: Step-by-step process with clear progress indicators
2. **Real-time Feedback**: Instant updates when selections change
3. **Clear Pricing**: Transparent pricing with tax breakdown
4. **Flexible Options**: Memberships or drop-in rates
5. **Easy Management**: Simple booking and membership management
6. **Mobile Friendly**: Works seamlessly on all devices
7. **Fast Performance**: Optimized for speed and responsiveness
8. **Error Recovery**: Helpful error messages with recovery options

---

## 🚀 Getting Started as a User

1. **Visit the website** → Browse homepage
2. **Sign up** → Create account and verify email
3. **Sign in** → Access your account
4. **Choose your path**:
   - **Option A**: Purchase membership → Book unlimited sessions
   - **Option B**: Book drop-in session → Pay per session
5. **Book a court** → Select sport, court, date, and time
6. **Confirm booking** → Payment (if needed) → Booking confirmed
7. **Manage bookings** → View, cancel, or book more sessions
8. **Manage membership** → Update payment, cancel, or renew

---

This comprehensive guide covers the entire user journey from landing on the website to managing bookings and memberships. The platform is designed to be intuitive, fast, and user-friendly, with clear paths for both members and drop-in guests.

