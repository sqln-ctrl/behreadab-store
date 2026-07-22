-- Fix hero_config: ensure row exists + add all new columns

-- 1. Add missing columns
ALTER TABLE public.hero_config ADD COLUMN IF NOT EXISTS featured_product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.hero_config ADD COLUMN IF NOT EXISTS featured_image_index  INTEGER DEFAULT 0;
ALTER TABLE public.hero_config ADD COLUMN IF NOT EXISTS product_size          INTEGER DEFAULT 280;
ALTER TABLE public.hero_config ADD COLUMN IF NOT EXISTS product_position      TEXT DEFAULT 'right';
ALTER TABLE public.hero_config ADD COLUMN IF NOT EXISTS hero_height           TEXT DEFAULT '100vh';
ALTER TABLE public.hero_config ADD COLUMN IF NOT EXISTS bg_opacity            INTEGER DEFAULT 20;
ALTER TABLE public.hero_config ADD COLUMN IF NOT EXISTS show_bg_media         BOOLEAN DEFAULT true;

-- 2. Insert a default row if the table is empty (so UPDATE always finds something)
INSERT INTO public.hero_config (headline, subheadline, subtext, cta_text, product_size, product_position, hero_height, bg_opacity, show_bg_media)
SELECT 'Andaaz', 'اندازِ وقت', 'Premium watches crafted for those who understand that time is not just measured — it is worn.', 'Shop Now', 280, 'right', '100vh', 20, true
WHERE NOT EXISTS (SELECT 1 FROM public.hero_config LIMIT 1);

-- 3. Fix RLS so backend can read and write
DROP POLICY IF EXISTS "service_role_hero_config" ON public.hero_config;
CREATE POLICY "service_role_hero_config" ON public.hero_config FOR ALL USING (true) WITH CHECK (true);

-- Verify
SELECT id, headline, product_size, product_position, hero_height, bg_opacity, show_bg_media FROM public.hero_config;
