-- Create Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'AED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('payment', 'deposit', 'withdrawal', 'earning', 'refund')),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    reference_id TEXT, -- e.g., trip_id or booking_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for Wallets
CREATE POLICY "Users can view their own wallet" ON wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON wallets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet" ON wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for Transactions
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (
        wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (
        wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid())
    );
