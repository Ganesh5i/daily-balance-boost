-- Add category, emoji, and default_quantity columns to protein_foods
ALTER TABLE public.protein_foods
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Other',
  ADD COLUMN IF NOT EXISTS emoji TEXT NOT NULL DEFAULT '🍽',
  ADD COLUMN IF NOT EXISTS default_quantity NUMERIC NOT NULL DEFAULT 100;

-- Update existing foods with categories and emojis
UPDATE public.protein_foods SET category = 'Animal Protein', emoji = '🍗' WHERE name = 'Chicken breast';
UPDATE public.protein_foods SET category = 'Animal Protein', emoji = '🐟' WHERE name = 'Fish (tuna/salmon)';
UPDATE public.protein_foods SET category = 'Animal Protein', emoji = '🥚', default_quantity = 6 WHERE name = 'Eggs (whole)';
UPDATE public.protein_foods SET category = 'Animal Protein', emoji = '🥚' WHERE name = 'Egg whites';
UPDATE public.protein_foods SET category = 'Dairy', emoji = '🥛', default_quantity = 500 WHERE name = 'Milk';
UPDATE public.protein_foods SET category = 'Dairy', emoji = '🥣', default_quantity = 200 WHERE name = 'Curd (yogurt)';
UPDATE public.protein_foods SET category = 'Dairy', emoji = '🧀' WHERE name = 'Cheese';
UPDATE public.protein_foods SET category = 'Dairy', emoji = '🧀' WHERE name = 'Paneer';
UPDATE public.protein_foods SET category = 'Dairy', emoji = '🥣' WHERE name = 'Greek yogurt';
UPDATE public.protein_foods SET category = 'Dairy', emoji = '💪', default_quantity = 1 WHERE name = 'Whey protein';
UPDATE public.protein_foods SET category = 'Soy', emoji = '🌱', default_quantity = 80 WHERE name = 'Soy chunks';
UPDATE public.protein_foods SET category = 'Soy', emoji = '🧊' WHERE name = 'Tofu';
UPDATE public.protein_foods SET category = 'Pulses & Legumes', emoji = '🫘', default_quantity = 50 WHERE name = 'Chickpeas (chana)';
UPDATE public.protein_foods SET category = 'Pulses & Legumes', emoji = '🍲' WHERE name = 'Lentils (dal)';
UPDATE public.protein_foods SET category = 'Pulses & Legumes', emoji = '🫘' WHERE name = 'Rajma (kidney beans)';
UPDATE public.protein_foods SET category = 'Nuts & Seeds', emoji = '🌰' WHERE name = 'Almonds';
UPDATE public.protein_foods SET category = 'Nuts & Seeds', emoji = '🥜' WHERE name = 'Peanuts';
UPDATE public.protein_foods SET category = 'Nuts & Seeds', emoji = '🥜' WHERE name = 'Peanut butter';
UPDATE public.protein_foods SET category = 'Nuts & Seeds', emoji = '🎃' WHERE name = 'Pumpkin seeds';
UPDATE public.protein_foods SET category = 'Nuts & Seeds', emoji = '🌱' WHERE name = 'Flax seeds';
UPDATE public.protein_foods SET category = 'Nuts & Seeds', emoji = '🌱' WHERE name = 'Chia seeds';

-- Insert new foods
INSERT INTO public.protein_foods (name, protein_per_unit, unit, sort_order, category, emoji, default_quantity) VALUES
-- Animal Protein
('Chicken Thigh', 26, '100g', 100, 'Animal Protein', '🍗', 100),
('Chicken Liver', 27, '100g', 101, 'Animal Protein', '🍖', 100),
('Mutton', 25, '100g', 102, 'Animal Protein', '🥩', 100),
('Lean Beef', 26, '100g', 103, 'Animal Protein', '🥩', 100),
('Sardines', 25, '100g', 104, 'Animal Protein', '🐟', 100),
('Prawns', 24, '100g', 105, 'Animal Protein', '🦐', 100),
('Crab', 19, '100g', 106, 'Animal Protein', '🦀', 100),
-- Dairy
('Buttermilk', 3.3, '100ml', 110, 'Dairy', '🥛', 250),
('Skim Milk Powder', 36, '100g', 111, 'Dairy', '🥛', 30),
-- Soy
('Soybeans (Dry)', 36, '100g', 120, 'Soy', '🌱', 50),
('Soy Milk', 3.3, '100ml', 121, 'Soy', '🥛', 250),
('Edamame', 11, '100g', 122, 'Soy', '🫛', 100),
-- Pulses & Legumes
('Green Gram (Dry / Moong)', 24, '100g', 130, 'Pulses & Legumes', '🫘', 50),
('Black Gram (Urad)', 25, '100g', 131, 'Pulses & Legumes', '🫘', 50),
('Horse Gram', 22, '100g', 132, 'Pulses & Legumes', '🫘', 50),
('Cowpeas', 24, '100g', 133, 'Pulses & Legumes', '🫘', 50),
('Black Chana', 19, '100g', 134, 'Pulses & Legumes', '🫘', 50),
('White Peas', 23, '100g', 135, 'Pulses & Legumes', '🫛', 50),
-- Grains
('Oats', 17, '100g', 140, 'Grains', '🌾', 50),
('Cooked White Rice', 2.6, '100g', 141, 'Grains', '🍚', 500),
('Brown Rice', 7.5, '100g raw', 142, 'Grains', '🍚', 100),
('White Rice (Raw)', 7, '100g', 143, 'Grains', '🍚', 100),
('Wheat Flour', 12, '100g', 144, 'Grains', '🌾', 100),
('Whole Wheat Bread', 9, '100g', 145, 'Grains', '🍞', 100),
('Quinoa', 14, '100g raw', 146, 'Grains', '🌾', 100),
('Ragi', 7, '100g', 147, 'Grains', '🌾', 100),
('Bajra', 11, '100g', 148, 'Grains', '🌾', 100),
('Jowar', 10, '100g', 149, 'Grains', '🌾', 100),
-- Nuts & Seeds
('Cashews', 18, '100g', 150, 'Nuts & Seeds', '🥜', 10),
('Walnuts', 15, '100g', 151, 'Nuts & Seeds', '🌰', 20),
('Pistachios', 20, '100g', 152, 'Nuts & Seeds', '🌰', 20),
('Sunflower Seeds', 21, '100g', 153, 'Nuts & Seeds', '🌻', 20),
('Sesame Seeds', 18, '100g', 154, 'Nuts & Seeds', '🌱', 20),
-- Indian Foods
('Idli', 5, '100g', 160, 'Indian Foods', '🍥', 100),
('Dosa', 4, '100g', 161, 'Indian Foods', '🥞', 100),
('Wheat Dosa', 6, '100g', 162, 'Indian Foods', '🥞', 100),
('Chapati', 8, '100g', 163, 'Indian Foods', '🫓', 100),
('Parotta', 7, '100g', 164, 'Indian Foods', '🫓', 100),
('Poori', 8, '100g', 165, 'Indian Foods', '🫓', 100),
('Upma', 5, '100g', 166, 'Indian Foods', '🍚', 100),
('Pongal', 4, '100g', 167, 'Indian Foods', '🍚', 100),
('Khichdi', 4, '100g', 168, 'Indian Foods', '🍚', 100),
-- Vegetables
('Spinach', 2.9, '100g', 170, 'Vegetables', '🥬', 100),
('Broccoli', 2.8, '100g', 171, 'Vegetables', '🥦', 100),
('Green Peas', 5, '100g', 172, 'Vegetables', '🫛', 100),
('Sweet Corn', 3.3, '100g', 173, 'Vegetables', '🌽', 100),
('Mushroom', 3.1, '100g', 174, 'Vegetables', '🍄', 100),
-- Fruits
('Banana', 1.1, '100g', 180, 'Fruits', '🍌', 100),
('Apple', 0.3, '100g', 181, 'Fruits', '🍎', 100),
('Orange', 0.9, '100g', 182, 'Fruits', '🍊', 100),
('Guava', 2.6, '100g', 183, 'Fruits', '🍈', 100),
('Avocado', 2, '100g', 184, 'Fruits', '🥑', 100);