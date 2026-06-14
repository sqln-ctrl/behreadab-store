-- ============================================================
-- WatchStore — Seed Data
-- Run AFTER schema.sql
-- Note: Create the admin user manually in Supabase Auth first,
-- then copy the UUID here to replace 'YOUR-ADMIN-UUID'
-- ============================================================

-- Products
INSERT INTO public.products (name, description, price, cost_price, category, badge, image, images, is_featured) VALUES
(
  'Rolex Submariner',
  'The Submariner is the reference among divers'' watches. Robust and waterproof, it features a unidirectional rotating bezel for dive time monitoring.',
  85000, 45000, 'Men', 'Bestseller',
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80',
  ARRAY['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80','https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80'],
  true
),
(
  'Omega Seamaster',
  'The Omega Seamaster is one of the world''s most iconic watches. Combining functionality with elegance, water resistant with a beautiful blue wave dial.',
  72000, 38000, 'Men', 'New',
  'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&q=80',
  ARRAY['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80'],
  true
),
(
  'Rose Gold Elegance',
  'Crafted with a delicate rose gold case and a mother-of-pearl dial. Perfect for both formal occasions and everyday wear.',
  58000, 28000, 'Women', 'Top Rated',
  'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80',
  ARRAY['https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&q=80'],
  true
),
(
  'Luxury Diamond Watch',
  'A masterpiece of precision and luxury. Set with brilliant-cut diamonds on the bezel, the ultimate symbol of sophistication.',
  120000, 65000, 'Women', 'Limited',
  'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&q=80',
  ARRAY['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80'],
  false
),
(
  'TAG Heuer Carrera',
  'Born on the racing circuits of the 1960s. A tribute to speed and precision with a clean dial and sporty design.',
  95000, 52000, 'Men', NULL,
  'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80',
  ARRAY['https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80'],
  false
),
(
  'Pearl Bracelet Watch',
  'A graceful fusion of a pearl bracelet and precision timepiece. Lightweight, feminine, and refined.',
  48000, 22000, 'Women', 'Sale',
  'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=500&q=80',
  ARRAY['https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=600&q=80'],
  false
);

-- Inventory for each product (stock_qty, reorder_point, reorder_qty)
INSERT INTO public.inventory (product_id, stock_qty, reorder_point, reorder_qty)
SELECT id,
  CASE name
    WHEN 'Rolex Submariner'    THEN 15
    WHEN 'Omega Seamaster'     THEN 10
    WHEN 'Rose Gold Elegance'  THEN 20
    WHEN 'Luxury Diamond Watch' THEN 5
    WHEN 'TAG Heuer Carrera'   THEN 8
    WHEN 'Pearl Bracelet Watch' THEN 12
  END,
  5, 20
FROM public.products;

-- Sample supplier
INSERT INTO public.suppliers (name, contact_name, email, phone, address, notes) VALUES
(
  'Swiss Time Imports',
  'Ahmad Raza',
  'ahmad@swisstime.pk',
  '+92-300-1234567',
  'Plot 45, SITE Area, Karachi, Pakistan',
  'Main watch supplier. Delivers within 2 weeks.'
),
(
  'Dubai Luxury Distributors',
  'Khalid Hassan',
  'khalid@dubailuxury.ae',
  '+971-50-9876543',
  'Al Quoz Industrial Area, Dubai, UAE',
  'Premium brands only. MOQ 3 pieces.'
);
