CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id UUID,
    first_name TEXT,
    last_name TEXT,
    role user_role,
    company TEXT DEFAULT NULL,
    phone TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Security: user can only create profile for themselves
    IF auth.uid() != user_id THEN
        RAISE EXCEPTION 'You can only create a profile for yourself';
    END IF;
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
        RAISE EXCEPTION 'Profile already exists for this user';
    END IF;
    
    INSERT INTO public.profiles (id, first_name, last_name, role, company, phone)
    VALUES (user_id, first_name, last_name, role, company, phone);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated; 