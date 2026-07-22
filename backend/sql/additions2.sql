-- Run this in Supabase SQL Editor

-- Store settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_charge         NUMERIC(10,2) DEFAULT 500,
  free_delivery_threshold NUMERIC(10,2) DEFAULT 5000,
  return_days             INTEGER DEFAULT 30,
  warranty_months         INTEGER DEFAULT 24,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "service_role_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- Add columns to reviews if missing
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS guest_name   TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_featured  BOOLEAN DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS source       TEXT DEFAULT 'website';
ALTER TABLE public.reviews ALTER COLUMN user_id DROP NOT NULL;

-- Add columns to orders if missing
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Add columns to hero_config if missing
ALTER TABLE public.hero_config ADD COLUMN IF NOT EXISTS featured_product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.hero_config ADD COLUMN IF NOT EXISTS featured_image_index  INTEGER DEFAULT 0;

-- Add warranty/return to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warranty_months  INTEGER DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS return_days      INTEGER DEFAULT NULL;

-- RLS: allow everything through service role (backend handles auth)
DO $$ 
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['products','inventory','inventory_transactions','suppliers','orders','order_items',
    'purchase_orders','purchase_order_items','payments','ledger_entries','hero_config','users','reviews',
    'wishlist_items','addresses','discounts','store_settings'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "service_role_%s" ON public.%s', tbl, tbl);
    EXECUTE format('CREATE POLICY "service_role_%s" ON public.%s FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;

-- Guest order support
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_email  TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS source       TEXT DEFAULT 'website';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_manual    BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT false;
