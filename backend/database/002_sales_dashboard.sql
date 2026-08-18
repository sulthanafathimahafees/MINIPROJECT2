-- ==================================================
-- OPTIBUY SALES DASHBOARD FULL-STACK MIGRATION
-- Migration File: 002_sales_dashboard.sql
-- Database: PostgreSQL (Public & OptiBuy Schemas)
-- ==================================================

-- 1. Customer Assistance Requests Table
CREATE TABLE IF NOT EXISTS public.customer_assistance_requests (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES public.users(user_id) ON DELETE CASCADE,
  sales_person_id INT REFERENCES public.users(user_id) ON DELETE SET NULL,
  product_id INT REFERENCES public.products(id) ON DELETE SET NULL,
  request_type VARCHAR(100) DEFAULT 'PRODUCT_INQUIRY',
  status VARCHAR(50) DEFAULT 'NEW',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sales Person Product Recommendations Table
CREATE TABLE IF NOT EXISTS public.product_recommendations (
  id SERIAL PRIMARY KEY,
  sales_person_id INT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  customer_id INT REFERENCES public.users(user_id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  recommendation_note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sales Person Logged Activities Table
CREATE TABLE IF NOT EXISTS public.sales_activities (
  id SERIAL PRIMARY KEY,
  sales_person_id INT NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  customer_id INT REFERENCES public.users(user_id) ON DELETE SET NULL,
  product_id INT REFERENCES public.products(id) ON DELETE SET NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sales Person Detailed Profiles Table
CREATE TABLE IF NOT EXISTS public.sales_person_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100) DEFAULT 'Showroom Sales',
  showroom_section VARCHAR(100) DEFAULT 'Smartphones & Laptops',
  monthly_sales_target_inr NUMERIC(12, 2) DEFAULT 500000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_assistance_customer ON public.customer_assistance_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_assistance_salesperson ON public.customer_assistance_requests(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_assistance_status ON public.customer_assistance_requests(status);

CREATE INDEX IF NOT EXISTS idx_recs_salesperson ON public.product_recommendations(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_recs_customer ON public.product_recommendations(customer_id);

CREATE INDEX IF NOT EXISTS idx_activities_salesperson ON public.sales_activities(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_sp_profile_user ON public.sales_person_profiles(user_id);
