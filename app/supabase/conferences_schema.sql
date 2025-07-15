-- Conference management schema
-- Creates tables for rooms, time slots, conferences and user registrations

-- Rooms table - Conference rooms available for the event
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time slots table - Fixed 45-minute time slots for each day
CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 3), -- Event lasts 3 days
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(day, start_time) -- Prevent duplicate slots on same day
);

-- Conferences table - Individual conferences scheduled in rooms and time slots
CREATE TABLE IF NOT EXISTS conferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    speaker_name VARCHAR(255) NOT NULL,
    speaker_photo TEXT, -- URL to speaker photo
    speaker_bio TEXT,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
    time_slot_id INTEGER REFERENCES time_slots(id) ON DELETE CASCADE NOT NULL,
    sponsored_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For sponsors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, time_slot_id) -- One conference per room per time slot
);

-- User registrations table - Tracks which conferences visitors are attending
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, conference_id) -- Prevent duplicate registrations
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conferences_room_timeslot ON conferences(room_id, time_slot_id);
CREATE INDEX IF NOT EXISTS idx_conferences_sponsored_by ON conferences(sponsored_by_user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_conference ON registrations(conference_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_day ON time_slots(day);

-- RLS policies for conferences
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;

-- Everyone can read conferences
CREATE POLICY "Anyone can view conferences" ON conferences
    FOR SELECT USING (true);

-- Only organizers can create conferences
CREATE POLICY "Only organizers can create conferences" ON conferences
    FOR INSERT WITH CHECK (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'organizer'
    );

-- Only organizers can update conferences
CREATE POLICY "Only organizers can update conferences" ON conferences
    FOR UPDATE USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'organizer'
    );

-- Only organizers can delete conferences
CREATE POLICY "Only organizers can delete conferences" ON conferences
    FOR DELETE USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'organizer'
    );

-- Sponsors can only update conferences they sponsor
CREATE POLICY "Sponsors can update their sponsored conferences" ON conferences
    FOR UPDATE USING (
        sponsored_by_user_id = auth.uid() 
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'sponsor'
    );

-- RLS policies for registrations
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations, organizers can view all
CREATE POLICY "Users can view own registrations, organizers view all" ON registrations
    FOR SELECT USING (
        user_id = auth.uid() 
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'organizer'
    );

-- Users can register themselves for conferences
CREATE POLICY "Users can register for conferences" ON registrations
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can unregister from conferences
CREATE POLICY "Users can unregister from conferences" ON registrations
    FOR DELETE USING (user_id = auth.uid());

-- RLS policies for rooms and time_slots (read-only for most users)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can view time slots" ON time_slots FOR SELECT USING (true);

CREATE POLICY "Only organizers can manage rooms" ON rooms
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'organizer');

CREATE POLICY "Only organizers can manage time slots" ON time_slots
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'organizer'); 