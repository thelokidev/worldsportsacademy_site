# World Sports Academy - User Flow Diagram

## 🗺️ Quick Reference Flow Chart

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANDING PAGE (/)                             │
│  - Hero Section with CTAs                                       │
│  - Sports Section                                               │
│  - Facilities Section                                           │
│  - Navigation: Home | Programs | Book Now | Memberships        │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  PROGRAMS    │  │ MEMBERSHIPS  │  │  BOOK NOW    │
    │    (/programs)│  │ (/memberships)│  │  (/bookings) │
    └──────────────┘  └──────────────┘  └──────────────┘
                              │                 │
                              │                 │ (Requires Auth)
                              │                 ▼
                              │         ┌──────────────┐
                              │         │   SIGN IN    │
                              │         │   (/signin)  │
                              │         └──────────────┘
                              │                 │
                              │                 ▼
                              │         ┌──────────────┐
                              │         │   SIGN UP    │
                              │         │   (/signup)  │
                              │         └──────────────┘
                              │                 │
                              │                 ▼
                              │         ┌──────────────┐
                              │         │  DASHBOARD   │
                              │         │ (/dashboard) │
                              │         └──────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ STRIPE CHECKOUT │
                    │  (Payment Flow) │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ MEMBERSHIP      │
                    │ ACTIVATED       │
                    └─────────────────┘
```

---

## 📋 Booking Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────┐
│              BOOKING PAGE (/bookings)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  STEP 1: SELECT SPORT                                 │  │
│  │  - Browse available sports                            │  │
│  │  - Click on sport card                                │  │
│  │  → Courts for sport load                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  STEP 2: SELECT COURT                                 │  │
│  │  - Browse available courts                            │  │
│  │  - Click on court card                                │  │
│  │  → Availability for 14 days loads                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  STEP 3: SELECT DATE                                  │  │
│  │  - Click on date in calendar                          │  │
│  │  → Time slots for date filter (instant)               │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  STEP 4: SELECT TIME                                  │  │
│  │  - Select time from dropdown                          │  │
│  │  → Authorization check (member vs drop-in)            │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                    │
│         ┌────────────────┼────────────────┐                  │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  MEMBER  │    │ DROP-IN  │    │  CANCEL  │              │
│  │ (Free)   │    │ (Payment)│    │          │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│         │                │                                    │
│         │                ▼                                    │
│         │         ┌──────────────┐                           │
│         │         │ STRIPE       │                           │
│         │         │ CHECKOUT     │                           │
│         │         └──────────────┘                           │
│         │                │                                    │
│         │                ▼                                    │
│         │         ┌──────────────┐                           │
│         │         │ PAYMENT      │                           │
│         │         │ CONFIRMED    │                           │
│         │         └──────────────┘                           │
│         │                │                                    │
│         └────────────────┼────────────────┘                  │
│                          │                                    │
│                          ▼                                    │
│              ┌──────────────────────┐                        │
│              │  BOOKING CONFIRMED   │                        │
│              │  Redirect to:        │                        │
│              │  /dashboard/bookings │                        │
│              └──────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 💳 Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    BOOKING SUMMARY                          │
│  - Sport: Selected                                          │
│  - Court: Selected                                          │
│  - Date: Selected                                           │
│  - Time: Selected                                           │
│  - Payment: Required (if drop-in)                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  CLICK "PAY & BOOK"             │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  CREATE PENDING BOOKING         │
        │  - Status: pending              │
        │  - Payment: pending             │
        │  - Booking ID: generated        │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  CREATE STRIPE CHECKOUT         │
        │  - Session created              │
        │  - Booking ID linked            │
        │  - Checkout URL returned        │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  REDIRECT TO STRIPE             │
        │  - User enters payment info     │
        │  - User completes payment       │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  STRIPE WEBHOOK                 │
        │  - Payment confirmed            │
        │  - Booking status: confirmed    │
        │  - Payment status: paid         │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  REDIRECT TO SUCCESS PAGE       │
        │  (/bookings/success)            │
        │  - Shows confirmation           │
        │  - Links to bookings page       │
        └─────────────────────────────────┘
```

---

## 👤 User Account Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    NOT AUTHENTICATED                        │
│  - Can browse: Home, Programs, Memberships                  │
│  - Cannot: Book courts, View dashboard                     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  SIGN UP (/signup)              │
        │  - Enter email & password       │
        │  - Submit form                  │
        │  - Receive verification email   │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  VERIFY EMAIL                   │
        │  - Click verification link      │
        │  - Email verified               │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  SIGN IN (/signin)              │
        │  - Enter email & password       │
        │  - Submit form                  │
        │  - Authenticated                │
        └─────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATED                            │
│  - Can: Book courts, View dashboard, Manage bookings        │
│  - Access: /dashboard, /bookings, /dashboard/bookings       │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  DASHBOARD   │  │ MY BOOKINGS  │  │ MY MEMBERSHIP│
│ (/dashboard) │  │(/dashboard/  │  │(/dashboard/  │
│              │  │  bookings)   │  │  membership) │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🎫 Membership Flow

```
┌─────────────────────────────────────────────────────────────┐
│              MEMBERSHIPS PAGE (/memberships)                │
│  - Browse available plans                                   │
│  - View pricing and features                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  CLICK "PURCHASE MEMBERSHIP"    │
        │  - Plan selected                │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  CHECK AUTHENTICATION           │
        │  - If not signed in → /signin   │
        │  - If signed in → Continue      │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  CREATE STRIPE CHECKOUT         │
        │  - Session created              │
        │  - Plan linked                  │
        │  - Checkout URL returned        │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  REDIRECT TO STRIPE             │
        │  - User enters payment info     │
        │  - User completes payment       │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  STRIPE WEBHOOK                 │
        │  - Payment confirmed            │
        │  - Membership created           │
        │  - Status: active               │
        │  - Auto-renewal: enabled        │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  MEMBERSHIP ACTIVATED           │
        │  - Unlimited access to sport    │
        │  - No drop-in fees              │
        │  - Monthly auto-renewal         │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  MANAGE MEMBERSHIP              │
        │  - View details                 │
        │  - Update payment method        │
        │  - Cancel subscription          │
        │  - View invoices                │
        └─────────────────────────────────┘
```

---

## 🔄 Booking States

```
┌──────────────┐
│   PENDING    │  → Created, awaiting payment
└──────────────┘
      │
      ▼ (Payment confirmed)
┌──────────────┐
│  CONFIRMED   │  → Active booking, can be cancelled
└──────────────┘
      │
      ├─→ (User cancels)
      │   ┌──────────────┐
      │   │  CANCELLED   │  → Cancelled by user
      │   └──────────────┘
      │
      └─→ (Time passes)
          ┌──────────────┐
          │     PAST     │  → Completed booking
          └──────────────┘
```

---

## 👨‍💼 Admin Flow

```
┌─────────────────────────────────────────────────────────────┐
│              ADMIN DASHBOARD (/admin/dashboard)             │
│  - View key metrics                                         │
│  - Quick actions                                            │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  BOOKINGS    │  │   MEMBERS    │  │   REVENUE    │
│  MANAGEMENT  │  │  MANAGEMENT  │  │   ANALYTICS  │
└──────────────┘  └──────────────┘  └──────────────┘
        │
        ▼
┌──────────────┐
│    COURTS    │
│  MANAGEMENT  │
│  - Block/    │
│    Unblock   │
│  - Schedules │
│  - Settings  │
└──────────────┘
```

---

## 🎯 Key Decision Points

### **1. Authentication Check**
```
User tries to access /bookings
    │
    ├─→ Not authenticated → Redirect to /signin?redirect=/bookings
    │
    └─→ Authenticated → Show booking page
```

### **2. Membership Check**
```
User selects time slot
    │
    ├─→ Has membership for sport → Free booking
    │
    └─→ No membership → Show drop-in pricing → Payment required
```

### **3. Payment Flow**
```
User clicks "Pay & Book"
    │
    ├─→ Create pending booking
    │
    ├─→ Create Stripe checkout session
    │
    ├─→ Redirect to Stripe
    │
    ├─→ User completes payment
    │
    └─→ Webhook confirms → Booking confirmed
```

### **4. Booking Cancellation**
```
User clicks "Cancel Booking"
    │
    ├─→ Booking is in future → Can cancel
    │
    ├─→ Booking is past → Cannot cancel
    │
    └─→ Booking cancelled → Slot freed up
```

---

## 📱 Mobile vs Desktop Experience

### **Desktop**
- Side-by-side layout (booking steps + summary)
- Full navigation menu
- Hover effects and animations
- Larger touch targets

### **Mobile**
- Stacked layout (booking steps above summary)
- Hamburger menu
- Touch-optimized buttons
- Responsive grids
- Swipe gestures (where applicable)

---

## 🔔 Real-time Features

### **1. Court Availability**
```
Booking created/updated/cancelled
    │
    ├─→ Supabase Realtime event
    │
    ├─→ All users viewing that court notified
    │
    └─→ Availability updated instantly
```

### **2. Booking Status**
```
Payment processed
    │
    ├─→ Stripe webhook received
    │
    ├─→ Booking status updated
    │
    └─→ User sees updated status
```

---

## 🎨 User Experience Highlights

1. **Progressive Disclosure**: Steps revealed one at a time
2. **Real-time Feedback**: Instant updates and validations
3. **Clear Progress**: Visual progress indicators
4. **Error Recovery**: Helpful error messages with recovery options
5. **Mobile First**: Optimized for all device sizes
6. **Performance**: Fast, optimized calculations
7. **Accessibility**: ARIA labels, keyboard navigation
8. **Security**: Secure authentication and payment processing

---

This diagram provides a visual overview of the complete user journey through the World Sports Academy platform. Refer to `USER_JOURNEY_GUIDE.md` for detailed explanations of each step.

