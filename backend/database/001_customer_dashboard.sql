-- ==================================================
-- OPTIBUY CUSTOMER DASHBOARD FULL-STACK MIGRATION
-- Migration File: 001_customer_dashboard.sql
-- Database: PostgreSQL (Public & OptiBuy Schemas)
-- ==================================================

-- 1. Product Categories Table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Brands Table
CREATE TABLE IF NOT EXISTS public.brands (
  id SERIAL PRIMARY KEY,
  brand_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Master Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES public.product_categories(id) ON DELETE CASCADE,
  brand_id INT REFERENCES public.brands(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  model_number VARCHAR(100),
  description TEXT,
  price_inr NUMERIC(12, 2) NOT NULL,
  original_price_inr NUMERIC(12, 2),
  discount_percentage INT DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 4.5,
  review_count INT DEFAULT 0,
  stock_quantity INT DEFAULT 15,
  stock_status VARCHAR(50) DEFAULT 'IN_STOCK',
  main_image_url TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compatibility Column Migration for Existing public.products Table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='id') THEN
    ALTER TABLE public.products ADD COLUMN id SERIAL UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='category_id') THEN
    ALTER TABLE public.products ADD COLUMN category_id INT REFERENCES public.product_categories(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='brand_id') THEN
    ALTER TABLE public.products ADD COLUMN brand_id INT REFERENCES public.brands(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='product_name') THEN
    ALTER TABLE public.products ADD COLUMN product_name VARCHAR(255);
    UPDATE public.products SET product_name = name WHERE product_name IS NULL AND name IS NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='price_inr') THEN
    ALTER TABLE public.products ADD COLUMN price_inr NUMERIC(12, 2);
    UPDATE public.products SET price_inr = price WHERE price_inr IS NULL AND price IS NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='original_price_inr') THEN
    ALTER TABLE public.products ADD COLUMN original_price_inr NUMERIC(12, 2);
    UPDATE public.products SET original_price_inr = original_price WHERE original_price_inr IS NULL AND original_price IS NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='stock_status') THEN
    ALTER TABLE public.products ADD COLUMN stock_status VARCHAR(50) DEFAULT 'IN_STOCK';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='model_number') THEN
    ALTER TABLE public.products ADD COLUMN model_number VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='description') THEN
    ALTER TABLE public.products ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='discount_percentage') THEN
    ALTER TABLE public.products ADD COLUMN discount_percentage INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='main_image_url') THEN
    ALTER TABLE public.products ADD COLUMN main_image_url TEXT;
    UPDATE public.products SET main_image_url = image_url WHERE main_image_url IS NULL AND image_url IS NOT NULL;
  END IF;
END $$;

-- 4. Product Specifications Table
CREATE TABLE IF NOT EXISTS public.product_specifications (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  specification_name VARCHAR(150) NOT NULL,
  specification_value TEXT NOT NULL
);

-- 5. Product Images Gallery Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) DEFAULT 'GALLERY',
  display_order INT DEFAULT 0
);

-- 6. Product Reviews Table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id INT REFERENCES public.users(user_id) ON DELETE SET NULL,
  rating NUMERIC(3, 2) NOT NULL,
  review_title VARCHAR(255),
  review_text TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'APPROVED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Customer Wishlist Table
CREATE TABLE IF NOT EXISTS public.customer_wishlist (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_product_wishlist UNIQUE (user_id, product_id)
);

-- 8. Customer Product Comparisons Table
CREATE TABLE IF NOT EXISTS public.customer_comparisons (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_product_comparison UNIQUE (user_id, product_id)
);

-- 9. Customer Decision Preferences Table
CREATE TABLE IF NOT EXISTS public.customer_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
  preferred_category VARCHAR(100),
  preferred_brand VARCHAR(100),
  minimum_budget_inr NUMERIC(12, 2) DEFAULT 10000,
  maximum_budget_inr NUMERIC(12, 2) DEFAULT 200000,
  preferred_features JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Customer Recently Viewed Products Table
CREATE TABLE IF NOT EXISTS public.customer_recently_viewed (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

CREATE INDEX IF NOT EXISTS idx_specs_product ON public.product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.customer_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_user ON public.customer_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user ON public.customer_preferences(user_id);
