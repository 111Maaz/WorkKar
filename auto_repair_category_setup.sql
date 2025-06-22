-- Auto Repair Category Setup Script
-- Execute this in your Supabase SQL Editor

-- 1. Insert Auto Repair category
INSERT INTO service_categories (id, name, created_at, updated_at)
VALUES ('auto_repair', 'Auto Repair', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Auto Repair subcategories
INSERT INTO service_subcategories (category_id, name, created_at, updated_at)
VALUES 
  ('auto_repair', 'Two-Wheeler', NOW(), NOW()),
  ('auto_repair', 'Four-Wheeler', NOW(), NOW()),
  ('auto_repair', 'Auto / Taxi / Van', NOW(), NOW()),
  ('auto_repair', 'Truck / Goods Vehicle', NOW(), NOW())
ON CONFLICT (category_id, name) DO NOTHING;

-- 3. Verify the insertion
SELECT 
  sc.name as category_name,
  ssc.name as subcategory_name
FROM service_categories sc
LEFT JOIN service_subcategories ssc ON sc.id = ssc.category_id
WHERE sc.id = 'auto_repair'
ORDER BY ssc.name; 