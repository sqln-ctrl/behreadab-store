-- Add OTP verification columns to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS otp         TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS otp_expiry  TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;

-- Add customer_name to orders for manual orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Mark existing users as verified (don't lock out existing accounts)
UPDATE public.users SET is_verified = true WHERE is_verified IS NULL OR is_verified = false;

-- Verify
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('otp','otp_expiry','is_verified');
