import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, schemaName } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSalesDashboardMigration() {
  console.log('[PostgreSQL Migration] Running 002_sales_dashboard.sql migration...');
  
  const sqlPath = path.join(__dirname, '../database/002_sales_dashboard.sql');
  const migrationSql = fs.readFileSync(sqlPath, 'utf8');

  await pool.query(migrationSql);
  console.log('[PostgreSQL Migration] All Sales Executive tables initialized successfully.');

  // Fetch approved Sales Persons from PostgreSQL
  const salesRes = await pool.query(
    `SELECT user_id, full_name, email FROM public.users WHERE role IN ('SALES_PERSON', 'SALES') AND status = 'ACTIVE'`
  );

  // Fetch registered Customers
  const customerRes = await pool.query(
    `SELECT user_id, full_name, email FROM public.users WHERE role = 'CUSTOMER' LIMIT 5`
  );

  // Fetch products
  const productRes = await pool.query(
    `SELECT id, product_name, price_inr FROM public.products LIMIT 5`
  );

  if (salesRes.rows.length > 0 && customerRes.rows.length > 0 && productRes.rows.length > 0) {
    const sp = salesRes.rows[0];
    const cust1 = customerRes.rows[0];
    const cust2 = customerRes.rows[1] || customerRes.rows[0];
    const prod1 = productRes.rows[0];
    const prod2 = productRes.rows[1] || productRes.rows[0];

    // Seed Sales Person Profile
    await pool.query(
      `INSERT INTO public.sales_person_profiles (user_id, employee_id, department, showroom_section, monthly_sales_target_inr)
       VALUES ($1, $2, 'Consumer Electronics Showroom', 'Smartphones & Laptops', 750000.00)
       ON CONFLICT (user_id) DO NOTHING`,
      [sp.user_id, `EMP-SP-${sp.user_id}`]
    );

    // Seed Assistance Requests
    await pool.query(
      `INSERT INTO public.customer_assistance_requests (customer_id, sales_person_id, product_id, request_type, status, notes)
       VALUES 
       ($1, $2, $3, 'PRODUCT_INQUIRY', 'NEW', 'Customer requested camera side-by-side spec demonstration for flagship smartphone.'),
       ($4, $2, $5, 'PRICE_NEGOTIATION', 'IN_PROGRESS', 'Customer inquired about showroom EMI discount options.')
       ON CONFLICT DO NOTHING`,
      [cust1.user_id, sp.user_id, prod1.id, cust2.user_id, prod2.id]
    );

    // Seed Recommendations
    await pool.query(
      `INSERT INTO public.product_recommendations (sales_person_id, customer_id, product_id, recommendation_note)
       VALUES 
       ($1, $2, $3, 'Recommended based on high display refresh rate requirement and camera zoom performance.'),
       ($1, $4, $5, 'Recommended because it fits within customer INR budget with 240Hz OLED panel.')
       ON CONFLICT DO NOTHING`,
      [sp.user_id, cust1.user_id, prod1.id, cust2.user_id, prod2.id]
    );

    // Seed Activity Log
    await pool.query(
      `INSERT INTO public.sales_activities (sales_person_id, activity_type, customer_id, product_id, details)
       VALUES 
       ($1, 'CUSTOMER_ASSISTANCE', $2, $3, 'Assisted customer with camera zoom performance inquiry.'),
       ($1, 'RECOMMENDATION_CREATED', $4, $5, 'Created tailored product recommendation card.')
       ON CONFLICT DO NOTHING`,
      [sp.user_id, cust1.user_id, prod1.id, cust2.user_id, prod2.id]
    );

    console.log('[PostgreSQL Seed] Sales Executive initial profiles, customer requests, and recommendations seeded.');
  }
}
