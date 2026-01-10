-- ============================================
-- Wasel 14 - Complete Database Schema
-- Supabase/PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('passenger', 'driver', 'admin', 'business');

-- Trip statuses
CREATE TYPE trip_status AS ENUM (
  'requested',
  'accepted',
  'arriving',
  'in_progress',
  'completed',
  'cancelled',
  'disputed'
);

-- Payment statuses
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'disputed'
);

-- Payment methods
CREATE TYPE payment_method_type AS ENUM (
  'card',
  'cash',
  'wallet',
  'apple_pay',
  'google_pay'
);

-- Vehicle types
CREATE TYPE vehicle_type AS ENUM (
  'economy',
  'comfort',
  'premium',
  'luxury',
  'motorcycle',
  'scooter',
  'van',
  'accessible'
);

-- Dispute status
CREATE TYPE dispute_status AS ENUM (
  'open',
  'under_review',
  'resolved',
  'closed'
);

-- Insurance claim status
CREATE TYPE insurance_claim_status AS ENUM (
  'filed',
  'under_review',
  'approved',
  'denied',
  'paid',
  'closed'
);

-- ============================================
-- TABLES
-- ============================================

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'passenger' NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  total_trips INTEGER DEFAULT 0,
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  preferred_currency TEXT DEFAULT 'USD',
  preferred_language TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{}',
  emergency_contact JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DRIVERS
-- ============================================

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  license_expiry DATE,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_plate TEXT,
  vehicle_type vehicle_type DEFAULT 'economy',
  vehicle_color TEXT,
  vehicle_insurance_expiry DATE,
  is_online BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT FALSE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  weekly_earnings DECIMAL(10, 2) DEFAULT 0.00,
  accept_rate DECIMAL(5, 2) DEFAULT 100.00,
  completion_rate DECIMAL(5, 2) DEFAULT 100.00,
  total_ratings INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  bank_account JSONB DEFAULT NULL,
 Documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VEHICLES
-- ============================================

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate_number TEXT NOT NULL,
  color TEXT,
  vehicle_type vehicle_type NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  insurance_expiry DATE,
  inspection_expiry DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIPS
-- ============================================

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passenger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status trip_status DEFAULT 'requested' NOT NULL,
  
  -- Route details
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  waypoints JSONB DEFAULT '[]',
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Vehicle type requested
  vehicle_type vehicle_type DEFAULT 'economy',
  
  -- Pricing
  base_fare DECIMAL(10, 2) NOT NULL,
  distance_km DECIMAL(10, 2),
  duration_minutes INTEGER,
  distance_fare DECIMAL(10, 2),
  time_fare DECIMAL(10, 2),
  booking_fee DECIMAL(10, 2) DEFAULT 0.00,
  surge_multiplier DECIMAL(4, 2) DEFAULT 1.00,
  promo_code TEXT,
  promo_discount DECIMAL(10, 2) DEFAULT 0.00,
  toll_fees DECIMAL(10, 2) DEFAULT 0.00,
  total_fare DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_method payment_method_type DEFAULT 'card',
  payment_status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Ratings & feedback
  passenger_rating DECIMAL(2, 1),
  passenger_feedback TEXT,
  driver_rating DECIMAL(2, 1),
  driver_feedback TEXT,
  
  -- Split payment
  is_split_payment BOOLEAN DEFAULT FALSE,
  split_parties INTEGER DEFAULT 1,
  
  -- Trip notes
  passenger_notes TEXT,
  driver_notes TEXT,
  
  -- Cancellation
  cancelled_by UUID,
  cancellation_reason TEXT,
  cancellation_fee DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Distance & route tracking
  route_polyline TEXT,
  actual_distance_km DECIMAL(10, 2),
  actual_duration_minutes INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIP LOCATIONS (tracking during trip)
-- ============================================

CREATE TABLE IF NOT EXISTS trip_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed_kmh DECIMAL(6, 2),
  accuracy DECIMAL(6, 2),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  payment_method payment_method_type NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  stripe_charge_id TEXT,
  refund_amount DECIMAL(10, 2) DEFAULT 0.00,
  refund_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT METHODS (saved cards)
-- ============================================

CREATE TABLE IF NOT EXISTS user_payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type payment_method_type NOT NULL,
  stripe_payment_method_id TEXT NOT NULL,
  card_brand TEXT,
  card_last_four TEXT,
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROMO CODES
-- ============================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount DECIMAL(10, 2),
  min_trip_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  applies_to vehicle_type[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROMO CODE USAGE
-- ============================================

CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAVORITES
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  type TEXT CHECK (type IN ('home', 'work', 'other')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAVED ADDRESSES (scheduled trips)
-- ============================================

CREATE TABLE IF NOT EXISTS saved_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  instructions TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_days INTEGER[],
  preferred_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCHEDULED TRIPS
-- ============================================

CREATE TABLE IF NOT EXISTS scheduled_trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  vehicle_type vehicle_type DEFAULT 'economy',
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  estimated_fare DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DISPUTES
-- ============================================

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  complainant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  dispute_type TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '[]',
  status dispute_status DEFAULT 'open' NOT NULL,
  resolution TEXT,
  refund_amount DECIMAL(10, 2),
  admin_notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================
-- REFUNDS
-- ============================================

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  status payment_status DEFAULT 'pending',
  stripe_refund_id TEXT,
  processed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ============================================
-- INSURANCE
-- ============================================

CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  policy_type TEXT NOT NULL,
  provider TEXT,
  policy_number TEXT,
  coverage_amount DECIMAL(12, 2),
  premium DECIMAL(10, 2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSURANCE CLAIMS
-- ============================================

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES insurance_policies(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  claimant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  claim_type TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  incident_location TEXT,
  damage_photos JSONB DEFAULT '[]',
  witness_info JSONB DEFAULT '[]',
  status insurance_claim_status DEFAULT 'filed' NOT NULL,
  adjuster_notes TEXT,
  approved_amount DECIMAL(12, 2),
  paid_amount DECIMAL(12, 2),
  filed_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- ============================================
-- ACCIDENT REPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS accident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  accident_type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'severe')),
  police_report_number TEXT,
  photos JSONB DEFAULT '[]',
  injuries_reported BOOLEAN DEFAULT FALSE,
  injuries_description TEXT,
  emergency_services_contacted BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAFETY REPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS safety_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '[]',
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DRIVER EARNINGS
-- ============================================

CREATE TABLE IF NOT EXISTS driver_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('trip_fare', 'bonus', 'adjustment', 'withdrawal', 'deposit')),
  description TEXT,
  balance_after DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DRIVER WITHDRAWALS
-- ============================================

CREATE TABLE IF NOT EXISTS driver_withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  bank_account_last_four TEXT,
  stripe_transfer_id TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  notes TEXT
);

-- ============================================
-- REFERRALS
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  referrer_reward DECIMAL(10, 2) DEFAULT 0.00,
  referred_reward DECIMAL(10, 2) DEFAULT 0.00,
  referrer_paid BOOLEAN DEFAULT FALSE,
  referred_paid BOOLEAN DEFAULT FALSE,
  referred_completed_trips INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'paid', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  qualified_at TIMESTAMPTZ
);

-- ============================================
-- MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'location', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- ============================================
-- BUSINESS ACCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS business_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  business_type TEXT,
  tax_id TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES business_accounts(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  cost_center TEXT,
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RIDE SOCIAL (social features)
-- ============================================

CREATE TABLE IF NOT EXISTS ride_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  max_passengers INTEGER DEFAULT 4,
  is_open BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ride_group_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES ride_groups(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  categories JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POPULAR ROUTES
-- ============================================

CREATE TABLE IF NOT EXISTS popular_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  city TEXT,
  trip_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIP ANALYTICS
-- ============================================

CREATE TABLE IF NOT EXISTS trip_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_trips_passenger ON trips(passenger_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_scheduled ON trips(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_trips_created ON trips(created_at);

CREATE INDEX IF NOT EXISTS idx_drivers_location ON drivers(current_latitude, current_longitude);
CREATE INDEX IF NOT EXISTS idx_drivers_available ON drivers(is_available, is_online);

CREATE INDEX IF NOT EXISTS idx_payments_trip ON payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_trip ON messages(trip_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_scheduled_trips_user ON scheduled_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_trips_date ON scheduled_trips(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy ON insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Drivers: Drivers can view/update own, admins can view all
CREATE POLICY "Drivers can view own" ON drivers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Drivers can update own" ON drivers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all drivers" ON drivers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trips: Users can view own trips, drivers can view assigned trips
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (
    auth.uid() = passenger_id OR
    auth.uid() = driver_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Drivers can update trip status" ON trips
  FOR UPDATE USING (
    auth.uid() = driver_id AND
    status IN ('accepted', 'arriving', 'in_progress')
  );

-- Payments: Users can view own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- User payment methods: Users can view own
CREATE POLICY "Users can view own payment methods" ON user_payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payment methods" ON user_payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Favorites: Users can manage own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Notifications: Users can view own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: Trip participants can view
CREATE POLICY "Trip participants can view messages" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND (passenger_id = auth.uid() OR driver_id = auth.uid()))
  );

CREATE POLICY "Trip participants can send messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND (passenger_id = auth.uid() OR driver_id = auth.uid()))
  );

-- Reviews: Public read, own create
CREATE POLICY "Public can view reviews" ON reviews
  FOR SELECT USING (is_public = true OR reviewer_id = auth.uid());

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_payment_methods_updated_at BEFORE UPDATE ON user_payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate driver rating
CREATE OR REPLACE FUNCTION calculate_driver_rating(driver_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
  total_ratings INTEGER;
BEGIN
  SELECT AVG(r.rating)::DECIMAL(3, 2), COUNT(*)
  INTO avg_rating, total_ratings
  FROM reviews r
  JOIN trips t ON r.trip_id = t.id
  WHERE t.driver_id = driver_uuid AND r.reviewer_id != driver_uuid;

  UPDATE drivers SET rating = COALESCE(avg_rating, 5.00), total_ratings = COALESCE(total_ratings, 0)
  WHERE id = driver_uuid;

  RETURN COALESCE(avg_rating, 5.00);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Insert sample promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, max_discount, usage_limit, is_active)
VALUES 
  ('WELCOME20', 'Welcome discount for new users', 'percentage', 20.00, 10.00, 10000, TRUE),
  ('FIRSTRIDE', 'Free first ride up to $15', 'fixed', 15.00, 15.00, 5000, TRUE),
  ('SAVE10', 'Save $10 on your next ride', 'fixed', 10.00, 10.00, NULL, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Insert popular routes (example data)
INSERT INTO popular_routes (name, description, pickup_address, pickup_latitude, pickup_longitude, dropoff_address, dropoff_latitude, dropoff_longitude, city, is_featured)
VALUES 
  ('Airport Express', 'Quick ride to the international airport', 'Downtown Plaza', 31.9539, 35.9106, 'International Airport', 31.9722, 36.0003, 'Amman', TRUE),
  ('City Center Tour', 'Explore the heart of the city', 'Rainbow Street', 31.9558, 35.9163, 'Amman Citadel', 31.9611, 35.9344, 'Amman', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMPLETE
-- ============================================

COMMENT ON DATABASE wasel IS 'Wasel Ride-Sharing Platform Database';
