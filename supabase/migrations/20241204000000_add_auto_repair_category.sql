-- Migration: Add Auto Repair category and subcategories
-- Date: 2024-12-04

-- Insert Auto Repair category into service_categories table
INSERT INTO service_categories (id, name, created_at, updated_at)
VALUES ('auto_repair', 'Auto Repair', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Auto Repair subcategories into service_subcategories table
INSERT INTO service_subcategories (category_id, name, created_at, updated_at)
VALUES 
  ('auto_repair', 'Two-Wheeler', NOW(), NOW()),
  ('auto_repair', 'Four-Wheeler', NOW(), NOW()),
  ('auto_repair', 'Auto / Taxi / Van', NOW(), NOW()),
  ('auto_repair', 'Truck / Goods Vehicle', NOW(), NOW())
ON CONFLICT (category_id, name) DO NOTHING;

-- Update the enum type if it exists (for PostgreSQL)
DO $$
BEGIN
    -- Add 'auto_repair' to the service_category enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'auto_repair' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'service_category')
    ) THEN
        ALTER TYPE service_category ADD VALUE 'auto_repair';
    END IF;
END $$; 