import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { runCustomerDashboardMigration } from './initCustomerDashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const host = process.env.PGHOST || process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10);
const user = process.env.PGUSER || process.env.DB_USER || process.env.DB_USERNAME || 'postgres';
const password = process.env.PGPASSWORD || process.env.DB_PASSWORD || process.env.DB_PASS || 'postgres';
const database = process.env.PGDATABASE || process.env.DB_NAME || process.env.DB_DATABASE || 'postgres';
export const schemaName = process.env.DB_SCHEMA || 'optibuy';

const connectionConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : { host, port, user, password, database };

export const pool = new Pool(connectionConfig);

// Set default search_path to include both optibuy and public schemas on connect
pool.on('connect', (client) => {
  client.query(`SET search_path TO ${schemaName}, public;`);
});

// Helper function to execute queries against PostgreSQL
export const query = (text, params) => pool.query(text, params);

// Auto-seed Admin if ADMIN_PASSWORD is set in backend/.env
const autoSeedAdminIfConfigured = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'optibuyadmin@gmail.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || !adminPassword.trim()) {
    return;
  }

  try {
    const schemasToSeed = [schemaName, 'public'];
    const passwordHash = await bcrypt.hash(adminPassword.trim(), 10);

    for (const s of schemasToSeed) {
      for (const t of ['tbl_users', 'users']) {
        try {
          const tableName = `${s}.${t}`;
          const userCheck = await pool.query(
            `SELECT user_id, email, role FROM ${tableName} WHERE LOWER(email) = $1`,
            [adminEmail]
          );

          if (userCheck.rows.length > 0) {
            await pool.query(
              `UPDATE ${tableName}
               SET password_hash = $1, role = 'ADMIN', status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
               WHERE user_id = $2`,
              [passwordHash, userCheck.rows[0].user_id]
            );
          } else {
            await pool.query(
              `INSERT INTO ${tableName} (full_name, email, phone, password_hash, role, status)
               VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVE')`,
              ['OptiBuy Admin', adminEmail, '+91 98765 43210', passwordHash]
            );
          }
        } catch (tblErr) {
          // Ignore if table alias does not exist yet
        }
      }
    }
    console.log(`[PostgreSQL Seed] Admin account configured for ${adminEmail} (Role: ADMIN).`);
  } catch (err) {
    console.error('[PostgreSQL Seed Warning]', err.message);
  }
};

// Seed Categories if table is empty
const autoSeedCategoriesIfEmpty = async () => {
  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM ${schemaName}.tbl_categories`);
    if (parseInt(countRes.rows[0].count, 10) > 0) return;

    const initialCats = [
      { name: 'Smartphones', description: 'Flagship & mid-range smartphones and mobile accessories' },
      { name: 'Laptops', description: 'Gaming, creator, and productivity laptops & Ultrabooks' },
      { name: 'Smart TVs', description: '4K OLED, QD-OLED, and QLED Smart Televisions' },
      { name: 'Headphones', description: 'Wireless active noise-cancelling headphones and earbuds' },
      { name: 'Appliances', description: 'Smart home and modern lifestyle electronics' }
    ];

    for (const c of initialCats) {
      await pool.query(
        `INSERT INTO ${schemaName}.tbl_categories (name, description, status) VALUES ($1, $2, 'ACTIVE') ON CONFLICT DO NOTHING`,
        [c.name, c.description]
      );
      await pool.query(
        `INSERT INTO public.categories (name, description, status) VALUES ($1, $2, 'ACTIVE') ON CONFLICT DO NOTHING`,
        [c.name, c.description]
      );
    }
    console.log(`[PostgreSQL Seed] Initial product categories seeded.`);
  } catch (err) {
    console.error('[PostgreSQL Category Seed Warning]', err.message);
  }
};

// Seed Products if table is empty
const autoSeedProductsIfEmpty = async () => {
  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM ${schemaName}.tbl_products`);
    if (parseInt(countRes.rows[0].count, 10) > 0) {
      return;
    }

    const initialProducts = [
      {
        name: 'Apple iPhone 15 Pro Max',
        brand: 'Apple',
        category: 'Smartphones',
        price: 134900,
        original_price: 149900,
        rating: 4.9,
        review_count: 3420,
        decision_score: 97,
        stock_quantity: 25,
        reorder_threshold: 5,
        image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
        badge: 'OptiBuy Top Pick',
        specs: JSON.stringify({ processor: 'A17 Pro Chip', display: '6.7" Super Retina XDR 120Hz', ram: '8GB Unified', storage: '256GB NVMe', battery: '4422 mAh' }),
        pros: JSON.stringify(['Titanium build quality', 'Best-in-class camera zoom', 'Superb battery life']),
        cons: JSON.stringify(['Slightly slower charging speed than competitors'])
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        category: 'Smartphones',
        price: 129999,
        original_price: 144999,
        rating: 4.8,
        review_count: 2890,
        decision_score: 96,
        stock_quantity: 18,
        reorder_threshold: 5,
        image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
        badge: 'Galaxy AI Enabled',
        specs: JSON.stringify({ processor: 'Snapdragon 8 Gen 3', display: '6.8" Dynamic AMOLED 2X 120Hz', ram: '12GB LPDDR5X', storage: '512GB UFS 4.0' }),
        pros: JSON.stringify(['Integrated S-Pen stylus', 'Anti-reflective display glass', '7 years OS updates']),
        cons: JSON.stringify(['Bulky boxy design'])
      },
      {
        name: 'Asus ROG Zephyrus G16 (2024)',
        brand: 'Asus',
        category: 'Laptops',
        price: 189999,
        original_price: 209999,
        rating: 4.9,
        review_count: 1120,
        decision_score: 98,
        stock_quantity: 3,
        reorder_threshold: 5,
        image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
        badge: 'Best OLED Gaming Laptop',
        specs: JSON.stringify({ processor: 'Intel Core Ultra 9 185H', display: '16" 2.5K 240Hz ROG Nebula OLED', ram: '32GB LPDDR5X', storage: '1TB PCIe 4.0 SSD', gpu: 'NVIDIA RTX 4080 12GB' }),
        pros: JSON.stringify(['CNC Aluminum unibody', 'Vibrant 240Hz OLED screen', '6-speaker audio system']),
        cons: JSON.stringify(['Soldered RAM cannot be upgraded'])
      },
      {
        name: 'Apple MacBook Pro 16" M3 Max',
        brand: 'Apple',
        category: 'Laptops',
        price: 349900,
        original_price: 379900,
        rating: 5.0,
        review_count: 940,
        decision_score: 99,
        stock_quantity: 12,
        reorder_threshold: 5,
        image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
        badge: 'Ultimate Creator Workstation',
        specs: JSON.stringify({ processor: 'Apple M3 Max (16-Core CPU)', display: '16.2" Liquid Retina XDR 120Hz', ram: '36GB Unified Memory', storage: '1TB Superfast SSD' }),
        pros: JSON.stringify(['Unmatched performance per watt', 'Liquid Retina XDR panel', 'Dead silent thermal profile']),
        cons: JSON.stringify(['High entry price for base configuration'])
      },
      {
        name: 'Sony BRAVIA XR A95L 65" QD-OLED',
        brand: 'Sony',
        category: 'Smart TVs',
        price: 279990,
        original_price: 329990,
        rating: 4.9,
        review_count: 780,
        decision_score: 97,
        stock_quantity: 2,
        reorder_threshold: 5,
        image_url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
        badge: 'Flagship QD-OLED TV',
        specs: JSON.stringify({ processor: 'Cognitive Processor XR', display: '65" 4K QD-OLED 120Hz', audio: 'Acoustic Surface Audio+ (60W)', os: 'Google TV' }),
        pros: JSON.stringify(['Unbeatable peak OLED brightness', 'Acoustic surface audio screen', 'Reference-grade color accuracy']),
        cons: JSON.stringify(['Only 2 HDMI 2.1 full bandwidth ports'])
      },
      {
        name: 'LG C3 55" OLED 4K Smart TV',
        brand: 'LG',
        category: 'Smart TVs',
        price: 139990,
        original_price: 169990,
        rating: 4.8,
        review_count: 1850,
        decision_score: 95,
        stock_quantity: 15,
        reorder_threshold: 5,
        image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
        badge: 'Best Value 4K OLED',
        specs: JSON.stringify({ processor: 'α9 AI Processor Gen6', display: '55" 4K OLED evo 120Hz', audio: '9.1.2 Virtual Surround Sound', os: 'webOS 23' }),
        pros: JSON.stringify(['4 full bandwidth HDMI 2.1 ports', 'Excellent gaming input lag', 'Slim gallery design']),
        cons: JSON.stringify(['No HDR10+ support'])
      },
      {
        name: 'Sony WH-1000XM5 Wireless ANC',
        brand: 'Sony',
        category: 'Headphones',
        price: 29990,
        original_price: 34990,
        rating: 4.8,
        review_count: 4210,
        decision_score: 96,
        stock_quantity: 40,
        reorder_threshold: 5,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        badge: 'Top Noise Cancelling',
        specs: JSON.stringify({ processor: 'Integrated Processor V1', driver: '30mm Carbon Fiber Unit', battery: '30 Hours ANC On' }),
        pros: JSON.stringify(['Class-leading active noise cancellation', 'Extremely comfortable & lightweight']),
        cons: JSON.stringify(['Non-foldable headband design'])
      }
    ];

    for (const p of initialProducts) {
      await pool.query(
        `INSERT INTO ${schemaName}.tbl_products 
         (name, brand, category, price, original_price, rating, review_count, decision_score, stock_quantity, reorder_threshold, image_url, badge, specs, pros, cons)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [p.name, p.brand, p.category, p.price, p.original_price, p.rating, p.review_count, p.decision_score, p.stock_quantity, p.reorder_threshold, p.image_url, p.badge, p.specs, p.pros, p.cons]
      );
      await pool.query(
        `INSERT INTO public.products 
         (name, brand, category, price, original_price, rating, review_count, decision_score, stock_quantity, reorder_threshold, image_url, badge, specs, pros, cons)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [p.name, p.brand, p.category, p.price, p.original_price, p.rating, p.review_count, p.decision_score, p.stock_quantity, p.reorder_threshold, p.image_url, p.badge, p.specs, p.pros, p.cons]
      );
    }
    console.log(`[PostgreSQL Seed] Initial product catalog seeded.`);
  } catch (err) {
    console.error('[PostgreSQL Product Seed Error]', err.message);
  }
};

// Seed Orders if table is empty
const autoSeedOrdersIfEmpty = async () => {
  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM ${schemaName}.tbl_orders`);
    if (parseInt(countRes.rows[0].count, 10) > 0) {
      return;
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'optibuyadmin@gmail.com').trim().toLowerCase();
    const userRes = await pool.query(`SELECT user_id FROM ${schemaName}.tbl_users WHERE LOWER(email) = $1 LIMIT 1`, [adminEmail]);
    const userId = userRes.rows.length > 0 ? userRes.rows[0].user_id : null;

    const prodRes = await pool.query(`SELECT product_id, price FROM ${schemaName}.tbl_products LIMIT 3`);
    if (prodRes.rows.length === 0) return;

    const sampleOrders = [
      { amount: 134900, status: 'Completed', payment: 'PAID' },
      { amount: 349900, status: 'Processing', payment: 'PAID' },
      { amount: 279990, status: 'Shipped', payment: 'PAID' },
      { amount: 129999, status: 'Completed', payment: 'PAID' }
    ];

    for (const ord of sampleOrders) {
      const orderInsert = await pool.query(
        `INSERT INTO ${schemaName}.tbl_orders (customer_id, total_amount, order_status, payment_status)
         VALUES ($1, $2, $3, $4)
         RETURNING order_id`,
        [userId, ord.amount, ord.status, ord.payment]
      );
      const orderId = orderInsert.rows[0].order_id;
      await pool.query(
        `INSERT INTO ${schemaName}.tbl_order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, 1, $3)`,
        [orderId, prodRes.rows[0].product_id, ord.amount]
      );

      // Mirror into public schema
      try {
        const pubOrder = await pool.query(
          `INSERT INTO public.orders (customer_id, total_amount, order_status, payment_status)
           VALUES ($1, $2, $3, $4) RETURNING order_id`,
          [userId, ord.amount, ord.status, ord.payment]
        );
        await pool.query(
          `INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, 1, $3)`,
          [pubOrder.rows[0].order_id, prodRes.rows[0].product_id, ord.amount]
        );
      } catch (pubErr) {
        // Ignore if alias
      }
    }

    console.log(`[PostgreSQL Seed] Initial orders seeded.`);
  } catch (err) {
    console.error('[PostgreSQL Order Seed Warning]', err.message);
  }
};

// Auto-initialize optibuy schema and all tables in both optibuy and public schemas
export const initDb = async () => {
  const initSql = `
    CREATE SCHEMA IF NOT EXISTS ${schemaName};

    -- ==================================================
    -- 1. PUBLIC SCHEMA TABLES (ACCESSIBLE DIRECTLY IN PGADMIN)
    -- ==================================================

    -- public.users
    CREATE TABLE IF NOT EXISTS public.users (
      user_id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
      status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
      password_reset_token_hash VARCHAR(255),
      password_reset_expires_at TIMESTAMP WITH TIME ZONE,
      department VARCHAR(255),
      employee_id VARCHAR(100),
      reason TEXT,
      reviewed_by INT,
      reviewed_at TIMESTAMP WITH TIME ZONE,
      rejection_reason TEXT,
      designation VARCHAR(255) DEFAULT 'Senior System Administrator',
      date_of_birth DATE,
      address TEXT,
      avatar_url TEXT,
      last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      settings JSONB DEFAULT '{"emailNotifications": true, "lowStockAlerts": true, "salesRequestAlerts": true, "refreshRate": 30, "theme": "dark"}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS public.tbl_users (LIKE public.users INCLUDING ALL);

    -- public.categories
    CREATE TABLE IF NOT EXISTS public.categories (
      category_id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS public.tbl_categories (LIKE public.categories INCLUDING ALL);

    -- public.products
    CREATE TABLE IF NOT EXISTS public.products (
      product_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price NUMERIC(12, 2) NOT NULL,
      original_price NUMERIC(12, 2),
      rating NUMERIC(3, 2) DEFAULT 4.5,
      review_count INT DEFAULT 0,
      decision_score INT DEFAULT 85,
      stock_quantity INT DEFAULT 20,
      reorder_threshold INT DEFAULT 5,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      image_url TEXT,
      badge VARCHAR(100),
      specs JSONB,
      pros JSONB,
      cons JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS public.tbl_products (LIKE public.products INCLUDING ALL);

    -- public.reviews
    CREATE TABLE IF NOT EXISTS public.reviews (
      review_id SERIAL PRIMARY KEY,
      product_id INT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
      user_id INT REFERENCES public.users(user_id) ON DELETE SET NULL,
      author_name VARCHAR(255) NOT NULL,
      rating NUMERIC(3, 2) NOT NULL,
      review_text TEXT NOT NULL,
      sentiment_score NUMERIC(4, 2) DEFAULT 0.85,
      sentiment_label VARCHAR(50) DEFAULT 'POSITIVE',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS public.tbl_reviews (LIKE public.reviews INCLUDING ALL);

    -- public.orders
    CREATE TABLE IF NOT EXISTS public.orders (
      order_id SERIAL PRIMARY KEY,
      customer_id INT REFERENCES public.users(user_id) ON DELETE CASCADE,
      salesperson_id INT REFERENCES public.users(user_id) ON DELETE SET NULL,
      total_amount NUMERIC(12, 2) NOT NULL,
      order_status VARCHAR(50) DEFAULT 'COMPLETED',
      payment_status VARCHAR(50) DEFAULT 'PAID',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS public.tbl_orders (LIKE public.orders INCLUDING ALL);

    -- public.order_items
    CREATE TABLE IF NOT EXISTS public.order_items (
      item_id SERIAL PRIMARY KEY,
      order_id INT NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
      product_id INT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
      quantity INT NOT NULL DEFAULT 1,
      unit_price NUMERIC(12, 2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.tbl_order_items (LIKE public.order_items INCLUDING ALL);

    -- ==================================================
    -- 2. OPTIBUY SCHEMA TABLES
    -- ==================================================

    CREATE TABLE IF NOT EXISTS ${schemaName}.tbl_users (LIKE public.users INCLUDING ALL);
    CREATE TABLE IF NOT EXISTS ${schemaName}.tbl_categories (LIKE public.categories INCLUDING ALL);
    CREATE TABLE IF NOT EXISTS ${schemaName}.tbl_products (LIKE public.products INCLUDING ALL);
    CREATE TABLE IF NOT EXISTS ${schemaName}.tbl_reviews (LIKE public.reviews INCLUDING ALL);
    CREATE TABLE IF NOT EXISTS ${schemaName}.tbl_orders (LIKE public.orders INCLUDING ALL);
    CREATE TABLE IF NOT EXISTS ${schemaName}.tbl_order_items (LIKE public.order_items INCLUDING ALL);

    -- Alter column migrations for backward compatibility across all schemas
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reorder_threshold INT DEFAULT 5;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
    ALTER TABLE ${schemaName}.tbl_products ADD COLUMN IF NOT EXISTS reorder_threshold INT DEFAULT 5;
    ALTER TABLE ${schemaName}.tbl_products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';

    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_reset_token_hash VARCHAR(255);
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department VARCHAR(255);
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100);
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reason TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reviewed_by INT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS designation VARCHAR(255) DEFAULT 'Senior System Administrator';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"emailNotifications": true, "lowStockAlerts": true, "salesRequestAlerts": true, "refreshRate": 30, "theme": "dark"}';

    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER';
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS password_reset_token_hash VARCHAR(255);
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS department VARCHAR(255);
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100);
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS reason TEXT;
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS reviewed_by INT;
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS designation VARCHAR(255) DEFAULT 'Senior System Administrator';
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE ${schemaName}.tbl_users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"emailNotifications": true, "lowStockAlerts": true, "salesRequestAlerts": true, "refreshRate": 30, "theme": "dark"}';

    -- Sync roles across users
    UPDATE public.users SET role = 'CUSTOMER' WHERE role IS NULL OR LOWER(role) = 'customer';
    UPDATE public.users SET role = 'SALES_PERSON' WHERE LOWER(role) = 'sales' OR LOWER(role) = 'salesperson' OR LOWER(role) = 'sales_person';
    UPDATE public.users SET role = 'ADMIN' WHERE LOWER(role) = 'admin';

    UPDATE ${schemaName}.tbl_users SET role = 'CUSTOMER' WHERE role IS NULL OR LOWER(role) = 'customer';
    UPDATE ${schemaName}.tbl_users SET role = 'SALES_PERSON' WHERE LOWER(role) = 'sales' OR LOWER(role) = 'salesperson' OR LOWER(role) = 'sales_person';
    UPDATE ${schemaName}.tbl_users SET role = 'ADMIN' WHERE LOWER(role) = 'admin';

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_public_users_email ON public.users(email);
    CREATE INDEX IF NOT EXISTS idx_public_users_role ON public.users(role);
    CREATE INDEX IF NOT EXISTS idx_public_users_status ON public.users(status);
    CREATE INDEX IF NOT EXISTS idx_public_products_category ON public.products(category);
    CREATE INDEX IF NOT EXISTS idx_public_products_brand ON public.products(brand);

    CREATE INDEX IF NOT EXISTS idx_tbl_users_email ON ${schemaName}.tbl_users(email);
    CREATE INDEX IF NOT EXISTS idx_tbl_users_role ON ${schemaName}.tbl_users(role);
    CREATE INDEX IF NOT EXISTS idx_tbl_users_status ON ${schemaName}.tbl_users(status);
    CREATE INDEX IF NOT EXISTS idx_tbl_products_category ON ${schemaName}.tbl_products(category);
    CREATE INDEX IF NOT EXISTS idx_tbl_products_brand ON ${schemaName}.tbl_products(brand);
  `;
  try {
    await pool.query(initSql);
    console.log(`[PostgreSQL] Schema "${schemaName}" and "public" schema tables initialized successfully.`);
    await autoSeedAdminIfConfigured();
    await autoSeedCategoriesIfEmpty();
    await autoSeedProductsIfEmpty();
    await autoSeedOrdersIfEmpty();
    await runCustomerDashboardMigration();
  } catch (err) {
    console.error('[PostgreSQL Initialization Error]', err.message);
  }
};
