-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  image_url   TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_categories"  ON public.categories FOR SELECT USING (true);
CREATE POLICY "service_role_categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Seed default categories
INSERT INTO public.categories (name, slug, is_featured, sort_order) VALUES
  ('Men',    'men',    true,  1),
  ('Women',  'women',  true,  2),
  ('Unisex', 'unisex', false, 3)
ON CONFLICT (name) DO NOTHING;

-- Verify
SELECT * FROM public.categories ORDER BY sort_order;
