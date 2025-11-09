# Quick Test Guide - Date Picker Fixes

## 🧪 5-Minute Test Plan

### Test 1: Rapid Clicking (30 seconds)
**What to do:**
1. Go to `/bookings` page
2. Select a sport and court
3. Open the date picker
4. Click 5 different dates in quick succession (as fast as you can)

**Expected Result:**
- ✅ All clicks register (or show visual feedback)
- ✅ Booking summary updates for each click
- ✅ No lag or frozen UI
- ✅ Final date selected is correct

**Previously:** Only the last click registered, intermediate clicks were lost

---

### Test 2: December Dates (30 seconds)
**What to do:**
1. Go to `/bookings` page
2. Select a sport and court
3. Open the date picker
4. Navigate to December 2025 (click forward arrow)
5. Try to click on December dates

**Expected Result:**
- ✅ Date range message appears: "Available dates: Today to [Date]"
- ✅ Dates beyond 14 days are grayed out (disabled)
- ✅ You CANNOT click on disabled December dates
- ✅ No "No available times" message for dates you can't select

**Previously:** December dates appeared clickable but showed no time slots (broken state)

---

### Test 3: Month Navigation (30 seconds)
**What to do:**
1. Go to `/bookings` page
2. Select a sport and court
3. Open the date picker
4. Click forward arrow to go to next month
5. Click backward arrow to return to current month
6. Repeat 2-3 times

**Expected Result:**
- ✅ Navigation is smooth and instant
- ✅ Only dates within 14-day window are enabled (not grayed)
- ✅ Calendar state is correct after navigation
- ✅ Selected date persists if still in view

**Previously:** Could navigate to months with all dates disabled (confusing)

---

### Test 4: Visual Feedback (30 seconds)
**What to do:**
1. Go to `/bookings` page
2. Select a sport and court
3. Look at the calendar/date picker

**Expected Result:**
- ✅ You see a message: "📅 Available: Today to [Date]" or "Available dates: Today to [Date]"
- ✅ Disabled dates are clearly grayed out
- ✅ Enabled dates are clearly visible and clickable
- ✅ Today's date is highlighted
- ✅ Selected date has green styling

**Previously:** No visual indicator of why dates were disabled

---

### Test 5: Complete Booking Flow (2 minutes)
**What to do:**
1. Go to `/bookings` page
2. Select a sport (e.g., Squash)
3. Select a court (e.g., Court 1)
4. Click on a date within the next 14 days
5. Select a time slot
6. Check booking summary
7. Click "Confirm Booking" (or "Pay & Book")

**Expected Result:**
- ✅ Each step responds instantly
- ✅ Booking summary updates in real-time
- ✅ Time slots appear immediately after selecting date
- ✅ Payment info shows correctly (member vs drop-in)
- ✅ Booking completes successfully

**Previously:** Lag when switching dates, confusion about availability

---

## 🎯 Quick Visual Check

### Before Fix
```
Calendar:
  Nov 24 ✓ (clickable)
  Nov 25 ✓ (clickable)
  ...
  Dec 1  ✓ (clickable) ← BROKEN: No time slots!
  Dec 2  ✓ (clickable) ← BROKEN: No time slots!
  Dec 15 ✓ (clickable) ← BROKEN: No time slots!
```

### After Fix
```
Date Range: "Available: Today to Nov 23, 2025"

Calendar:
  Nov 9  ✓ (enabled, green when selected)
  Nov 10 ✓ (enabled)
  ...
  Nov 23 ✓ (enabled) ← Last available date
  Nov 24 ✗ (grayed out, disabled)
  Nov 25 ✗ (grayed out, disabled)
  ...
  Dec 1  ✗ (grayed out, disabled) ← Fixed!
  Dec 15 ✗ (grayed out, disabled) ← Fixed!
```

---

## 🐛 Known Issues (If These Occur, Report Them)

### Issue: Rapid clicks still don't register
- **Symptom:** Clicking 5 dates quickly results in only 1-2 selections
- **Action:** Report to developer with browser/device info

### Issue: December dates still appear clickable
- **Symptom:** December dates are not grayed out
- **Action:** Check if date is within 14 days of today
- If yes, that's correct behavior
- If no, report as bug

### Issue: Date range message doesn't appear
- **Symptom:** No "Available dates" message visible
- **Action:** Take screenshot and report

### Issue: Calendar is slow or laggy
- **Symptom:** Delay when clicking dates (>500ms)
- **Action:** Check browser console for errors, report with browser info

---

## ✅ Success Criteria

All 5 tests should pass with:
- ✅ Instant response to date clicks
- ✅ December dates properly disabled
- ✅ Clear visual feedback
- ✅ Smooth month navigation
- ✅ Complete booking flow works

**Estimated Total Test Time:** 5 minutes

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

Test 1 - Rapid Clicking:        [ ] Pass  [ ] Fail
Test 2 - December Dates:         [ ] Pass  [ ] Fail
Test 3 - Month Navigation:       [ ] Pass  [ ] Fail
Test 4 - Visual Feedback:        [ ] Pass  [ ] Fail
Test 5 - Complete Booking Flow:  [ ] Pass  [ ] Fail

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## 🚀 Quick Comparison

| Feature | Before | After |
|---------|--------|-------|
| Rapid clicks | ❌ Lost | ✅ Instant |
| December dates | ❌ Broken | ✅ Disabled |
| Date range | ❌ Unclear | ✅ Clear message |
| Performance | ❌ Laggy | ✅ Fast |
| UX | ❌ Confusing | ✅ Professional |

---

**Ready to test?** Just follow Tests 1-5 above and verify all expected results are correct!

