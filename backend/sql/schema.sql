-- ============================================================
-- WatchStore — Full PostgreSQL Schema for Supabase
-- Run this entire file in Supabase > SQL Editor > New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- USERS (extends Supabase auth.users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar      TEXT DEFAULT '',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- SUPPLIERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppliers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  contact_name  TEXT DEFAULT '',
  email         TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  notes         TEXT DEFAULT '',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  price         NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  cost_price    NUMERIC(12,2) DEFAULT 0 CHECK (cost_price >= 0),
  category      TEXT NOT NULL CHECK (category IN ('Men', 'Women', 'Unisex')),
  badge         TEXT CHECK (badge IN ('Bestseller','New','Top Rated','Limited','Sale') OR badge IS NULL),
  image         TEXT DEFAULT '',
  images        TEXT[] DEFAULT '{}',
  rating        NUMERIC(3,2) DEFAULT 0,
  num_reviews   INT DEFAULT 0,
  is_featured   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INVENTORY
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  stock_qty       INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  reserved_qty    INT NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
  reorder_point   INT NOT NULL DEFAULT 5,
  reorder_qty     INT NOT NULL DEFAULT 20,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW public.inventory_available AS
  SELECT *, (stock_qty - reserved_qty) AS available_qty FROM public.inventory;

-- ─────────────────────────────────────────
-- INVENTORY TRANSACTIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id         UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  purchase_order_id   UUID,
  type                TEXT NOT NULL CHECK (type IN ('sale','restock','adjustment','return','damaged')),
  qty_change          INT NOT NULL,
  notes               TEXT DEFAULT '',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PURCHASE ORDERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id     UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Sent','Received','Cancelled')),
  total_cost      NUMERIC(12,2) DEFAULT 0,
  expected_date   DATE,
  received_date   DATE,
  notes           TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id   UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  qty                 INT NOT NULL CHECK (qty > 0),
  unit_cost           NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),
  qty_received        INT DEFAULT 0
);

ALTER TABLE public.inventory_transactions
  ADD CONSTRAINT fk_inv_trans_po
  FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Processing','Shipped','Delivered','Cancelled')),
  items_total       NUMERIC(12,2) NOT NULL,
  shipping_cost     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount      NUMERIC(12,2) NOT NULL,
  payment_method    TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod','stripe','jazzcash','easypaisa')),
  is_paid           BOOLEAN DEFAULT false,
  paid_at           TIMESTAMPTZ,
  tracking_number   TEXT DEFAULT '',
  shipping_address  JSONB NOT NULL,
  notes             TEXT DEFAULT '',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  image       TEXT NOT NULL DEFAULT '',
  price       NUMERIC(12,2) NOT NULL,
  cost_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  qty         INT NOT NULL CHECK (qty > 0)
);

-- ─────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL DEFAULT 'cod',
  provider_ref  TEXT DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  amount        NUMERIC(12,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'PKR',
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- LEDGER — double-entry accounting
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  purchase_order_id   UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  type                TEXT NOT NULL CHECK (type IN ('sale','refund','cogs','shipping','expense','restock','adjustment')),
  debit_account       TEXT NOT NULL,
  credit_account      TEXT NOT NULL,
  amount              NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency            TEXT NOT NULL DEFAULT 'PKR',
  description         TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ADDRESSES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  street        TEXT NOT NULL,
  city          TEXT NOT NULL,
  province      TEXT NOT NULL,
  postal_code   TEXT DEFAULT '',
  is_default    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- WISHLIST
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─────────────────────────────────────────
-- HERO CONFIG
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hero_config (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  headline        TEXT DEFAULT 'Timeless',
  subheadline     TEXT DEFAULT 'Elegance.',
  subtext         TEXT DEFAULT 'Premium watches crafted for style, precision, and performance.',
  image_url       TEXT DEFAULT 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=85',
  badge_text      TEXT DEFAULT 'New Arrival',
  badge_sub       TEXT DEFAULT 'Swiss Collection 2025',
  from_price      TEXT DEFAULT '199',
  discount_text   TEXT DEFAULT '',
  cta_text        TEXT DEFAULT 'Shop Now',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.hero_config (id) VALUES (uuid_generate_v4()) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_hero_updated_at BEFORE UPDATE ON public.hero_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products SET
    rating = (SELECT COALESCE(AVG(rating),0) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
    num_reviews = (SELECT COUNT(*) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_rating AFTER INSERT OR UPDATE OR DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE OR REPLACE FUNCTION update_inventory_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.inventory SET stock_qty = stock_qty + NEW.qty_change, updated_at = NOW()
  WHERE product_id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_transaction AFTER INSERT ON public.inventory_transactions FOR EACH ROW EXECUTE FUNCTION update_inventory_on_transaction();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_config ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read_products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "public_read_hero" ON public.hero_config FOR SELECT USING (true);

-- Users: own data
CREATE POLICY "users_own" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "addresses_own" ON public.addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "wishlist_own" ON public.wishlist_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "orders_own_read" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_own_create" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "order_items_own" ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "reviews_write" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin: full access
DO $$ DECLARE t TEXT;
BEGIN FOR t IN SELECT unnest(ARRAY[
  'products','inventory','suppliers','orders','order_items',
  'purchase_orders','purchase_order_items','inventory_transactions',
  'payments','ledger_entries','hero_config','users'
]) LOOP
  EXECUTE format('CREATE POLICY "admin_all_%s" ON public.%I FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = ''admin'')', t, t);
END LOOP; END $$;

-- ─────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
