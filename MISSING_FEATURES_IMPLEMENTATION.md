<h1>Wasel Application Implementation Roadmap</h1>

This document outlines the tasks required to complete the missing functionality in both the Mobile and Web applications.

## 🚨 Critical Infrastructure (Both Platforms)

### 1. Payment Backend (Supabase Edge Functions)
- [ ] Create `supabase/functions/payment-sheet/index.ts` to generate Stripe `client_secret`.
- [ ] Create `supabase/functions/refund/index.ts` to handle refunds.
- [ ] Connect Mobile `PaymentService` to call `payment-sheet` function.
- [ ] Update Web `usePayments` to call `payment-sheet` function.

### 2. Trip Cancellation Logic
- [ ] Implement `cancelBooking` in `bookingsAPI`.
  - [ ] Update booking status to 'cancelled'.
  - [ ] Restore seat count in `trips` table.
  - [ ] Trigger refund process (if paid).
- [ ] Implement `cancelTrip` in `tripsAPI`.
  - [ ] Update trip status to 'cancelled'.
  - [ ] Notify all booked passengers.
  - [ ] Trigger refunds for all passengers.

### 3. Ratings & Reviews System
- [ ] Create `ratings` table in Supabase.
- [ ] Create `RateDriver` component (Modal/Dialog).
- [ ] Integrate rating submission after trip completion.
- [ ] Update `profiles` table to recalculate average rating.

### 4. Forgot Password Flow
- [ ] Add `resetPasswordForEmail` call in `authAPI`.
- [ ] Create "Forgot Password" screen in Mobile (`app/auth/forgot-password.tsx`).
- [ ] Create "Forgot Password" modal in Web.

---

## 📱 Mobile App Tasks

### 1. Chat Enhancements
- [ ] Add "Start Chat" button to public user profiles.
- [ ] Handle push notifications for new messages (deep link to chat).

### 2. Deep Linking
- [ ] Configure `expo-linking`.
- [ ] Handle `wasel://trips/:id` to open Trip Details directly.

---

## 💻 Web App Tasks

### 1. Real-Time Chat Interface
- [ ] Port `ChatScreen` logic from Mobile to Web.
- [ ] Create a dedicated `/messages` route/page.

### 2. Profile Editing
- [ ] Create `EditProfileForm` component.
- [ ] Add file uploader for Avatar updates.

### 3. Routing Architecture
- [ ] Migrate `App.tsx` state-based routing to `react-router-dom`.
- [ ] Ensure URLs update correctly (e.g., `wasel.com/trips/123`).

---

## 🛠 Next Immediate Steps for Developer
1. **Initialize Supabase Edge Functions** to handle the Stripe secrets securely.
2. **Implement Cancellation Logic** as it affects data integrity.
3. **Build Rating System** to complete the trust loop.
