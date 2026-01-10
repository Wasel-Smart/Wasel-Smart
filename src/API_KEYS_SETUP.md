# Wassel API Keys Setup Guide

This guide provides step-by-step instructions for obtaining all required API keys for the Wassel ride-sharing platform.

---

## 📋 Required API Keys

| Service | Purpose | Priority | Estimated Cost |
|---------|---------|----------|----------------|
| Supabase | Backend database & auth | **High** | $0-$25/month |
| Google Maps | Maps & location services | **High** | $0-$200/month |
| Stripe | Payment processing | **High** | 2.9% + $0.30/txn |
| Firebase | Push notifications | **Medium** | $0/month |
| Twilio (Optional) | SMS notifications | **Medium** | $0.01/SMS |

---

## 🚀 Step 1: Supabase Setup

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign Up"
3. Sign up with GitHub, GitLab, or email
4. Verify your email address

### 1.2 Create New Project
1. Click "New Project"
2. Select your organization
3. Enter project details:
   - **Name**: `wassel-app` (or your preferred name)
   - **Database Password**: Generate a strong password and save it!
   - **Region**: Select closest to your users (e.g., `us-east-1` for US, `ap-southeast-1` for Asia)

### 1.3 Get API Credentials
1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - **URL**: `https://your-project-id.supabase.co`
   - **anon key**: `eyJhbGciOiJIUzI1NiIsInR...` (public key)
3. Go to **Project Settings** → **Database**
4. Copy:
   - **Host**: `your-project-id.supabase.co`
   - **Database name**: `postgres`
   - **User**: `postgres`
   - **Password**: (the password you saved earlier)

### 1.4 Enable Required Extensions
Run this SQL in Supabase SQL Editor:
```sql
-- Enable PostGIS for geo queries
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_cron for scheduled tasks
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

### 1.5 Run Database Schema
1. Go to **SQL Editor**
2. Open `supabase/complete_schema.sql`
3. Run all statements to create tables, indexes, and functions

---

## 🗺️ Step 2: Google Maps Setup

### 2.1 Create Google Cloud Account
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Accept terms of service

### 2.2 Create New Project
1. Click "Select a project" → "New Project"
2. Enter project name: `Wassel App`
3. Select organization (or none)
4. Click "Create"

### 2.3 Enable Required APIs
1. Go to **APIs & Services** → **Library**
2. Enable these APIs:
   - Maps JavaScript API (for map display)
   - Places API (for location search)
   - Directions API (for route planning)
   - Geocoding API (for address conversion)
   - Distance Matrix API (for distance calculations)

### 2.4 Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Click "Restrict Key" to set restrictions:
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**: Add your domain(s)
   - **API restrictions**: Select the APIs you enabled

### 2.5 Set Up Billing (Required for API usage)
1. Go to **Billing** in Google Cloud Console
2. Link a billing account to your project
3. Set up budget alerts to avoid unexpected charges

**Estimated Cost**: $0-$200/month depending on usage
- First $200/month is free for Maps Platform
- Approximately $4-10 per 1,000 map loads

---

## 💳 Step 3: Stripe Setup

### 3.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Click "Start now" → "Sign up"
3. Enter your email and create password
4. Complete business verification

### 3.2 Get API Keys
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Click **Developers** → **API keys**
3. Copy:
   - **Publishable key**: `pk_test_...` (use in frontend)
   - **Secret key**: `sk_test_...` (use in Supabase functions)

### 3.3 Set Up Webhook (Critical for payments)
1. Go to **Developers** → **Webhooks**
2. Click "Add endpoint"
3. Enter your Supabase function URL:
   - `https://your-project-id.supabase.co/functions/v1/payment-confirm`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the webhook signing secret

### 3.4 Configure Products
1. Go to **Products** → **Add product**
2. Create products for your services:
   - "Ride Booking"
   - "Package Delivery"
   - "Premium Subscription"

### 3.5 Test Your Integration
1. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0000 0000 3220`
2. Always use test mode (`sk_test_...`) during development

---

## 🔥 Step 4: Firebase Setup

### 4.1 Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `Wassel App`
4. Disable Google Analytics (or enable if you want)
5. Wait for project creation

### 4.2 Register Web App
1. Click **Project Overview** → **Add app** (web icon `</>`)
2. Register app with nickname: `Wassel Web`
3. Copy:
   - **Firebase config** object with:
     - `apiKey`
     - `authDomain`
     - `projectId`
     - `storageBucket`
     - `messagingSenderId`
     - `appId`

### 4.3 Enable Firebase Authentication
1. Go to **Authentication** → **Get started**
2. Enable these sign-in methods:
   - Email/Password
   - Phone (optional, requires Twilio)
   - Google (optional)
   - Anonymous (for guest users)

### 4.4 Set Up Cloud Messaging (Push Notifications)
1. Go to **Project Settings** → **Cloud Messaging**
2. Copy:
   - **Server key** (for Supabase functions)
   - **Sender ID**

### 4.5 Configure Firestore (Optional - for chat/messages)
1. Go to **Firestore Database** → **Create database**
2. Select "Start in production mode"
3. Set security rules for production

---

## 📱 Step 5: Twilio Setup (Optional - SMS)

### 5.1 Create Twilio Account
1. Go to [twilio.com](https://www.twilio.com)
2. Sign up for a trial or paid account
3. Verify your phone number

### 5.2 Get Credentials
1. Go to **Console** → **Account** → **API Keys**
2. Copy:
   - **Account SID**: `AC...`
   - **Auth Token**: (hidden, click to reveal)
3. Go to **Phone Numbers** → **Manage** → **Active Numbers**
4. Copy your Twilio phone number: `+1234567890`

### 5.3 Configure Supabase Function
Add these environment variables to Supabase:
```sql
update secrets set value = 'your_twilio_account_sid' where name = 'TWILIO_ACCOUNT_SID';
update secrets set value = 'your_twilio_auth_token' where name = 'TWILIO_AUTH_TOKEN';
update secrets set value = '+1234567890' where name = 'TWILIO_PHONE_NUMBER';
```

---

## ✅ Step 6: Configure Environment Variables

### 6.1 Update .env File
Copy `.env.example` to `.env` and fill in all values:

```bash
# Wassel Environment Variables
VITE_APP_NAME=Wassel
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# API Configuration
VITE_API_URL=https://api.wassel.app
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# External Services
VITE_GOOGLE_MAPS_API_KEY=AIza...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_FIREBASE_API_KEY=AIza...

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_GEOLOCATION=true

# Demo Mode (set to false when API keys are configured)
VITE_DEMO_MODE=false
```

### 6.2 Configure Supabase Secrets
Run in Supabase SQL Editor:
```sql
-- Add secrets for payment processing
insert into secrets (name, value) values
('STRIPE_SECRET_KEY', 'sk_test_...'),
('STRIPE_WEBHOOK_SECRET', 'whsec_...'),
('FIREBASE_SERVER_KEY', 'AAA...'),
('TWILIO_ACCOUNT_SID', 'AC...'),
('TWILIO_AUTH_TOKEN', '...'),
('TWILIO_PHONE_NUMBER', '+1234567890');
```

---

## 🧪 Step 7: Testing Your Setup

### 7.1 Local Testing
```bash
# Install dependencies
npm install

# Start development server
npm start

# Check browser console for errors
```

### 7.2 Verify Each Service

**Supabase:**
- Open browser DevTools → Network tab
- Reload app - should see Supabase requests succeed

**Google Maps:**
- Check if map loads on Dashboard
- Try searching for a location

**Stripe:**
- Go to Payment Methods
- Add a test card (4242 4242...)
- Check console for successful tokenization

**Firebase:**
- Check browser console for FCM token
- Try sending a test notification

---

## 🔒 Security Best Practices

### 8.1 Environment Variables
- ✅ Never commit `.env` to Git
- ✅ Use `.env.example` as template
- ✅ Add `.env` to `.gitignore`

### 8.2 API Key Restrictions
- ✅ Restrict keys by domain/IP
- ✅ Use separate keys for dev/staging/prod
- ✅ Rotate keys regularly

### 8.3 Supabase RLS
- ✅ Enable Row Level Security on all tables
- ✅ Test RLS policies before deployment
- ✅ Never disable RLS in production

### 8.4 Stripe Security
- ✅ Never expose secret key in frontend
- ✅ Verify webhook signatures
- ✅ Use webhook idempotency

---

## 📊 Cost Estimates

| Service | Free Tier | Production Cost |
|---------|-----------|-----------------|
| Supabase | 500MB DB, 2GB bandwidth | $0-$25/month |
| Google Maps | $200/month credit | $0-$200/month |
| Stripe | No fees for testing | 2.9% + $0.30/txn |
| Firebase | 1GB Firestore, 1GB Hosting | $0-$50/month |
| Twilio | None | $0.01/SMS |

---

## 🚀 Next Steps

After setting up all API keys:

1. ✅ Update `.env` file with all credentials
2. ✅ Test app in development mode
3. ✅ Configure Supabase database schema
4. ✅ Set up Stripe webhooks
5. ✅ Test payment flow end-to-end
6. ✅ Configure push notifications
7. ✅ Deploy to production

---

## 📞 Support Links

- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Google Maps**: [developers.google.com/maps](https://developers.google.com/maps/documentation)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **Firebase**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Twilio**: [twilio.com/docs](https://www.twilio.com/docs)

---

*Last Updated: January 9, 2026*
