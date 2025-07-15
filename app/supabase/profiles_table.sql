-- User roles enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('organizer', 'visitor', 'sponsor');
    END IF;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'visitor',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile and organizers can view all" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile and organizers can update all" ON profiles;

CREATE POLICY "Users can view own profile and organizers can view all" ON profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR 
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'organizer'
    );

CREATE POLICY "Users can create own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile and organizers can update all" ON profiles
    FOR UPDATE USING (
        auth.uid() = id 
        OR 
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'organizer'
    ); 