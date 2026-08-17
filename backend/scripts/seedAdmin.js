import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force reload backend/.env with override: true
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath, override: true });

import bcrypt from 'bcryptjs';
import { pool, schemaName, initDb } from '../db/index.js';

const seedAdmin = async () => {
  // Re-read after load
  dotenv.config({ path: envPath, override: true });
  
  const adminEmail = (process.env.ADMIN_EMAIL || 'optibuyadmin@gmail.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : '';

  if (!adminPassword) {
    console.log(`==================================================`);
    console.log(`⚠️  [OptiBuy Admin Seed] ADMIN_PASSWORD is empty in backend/.env`);
    console.log(`👉 Please open d:\\optibuy\\backend\\.env, set ADMIN_PASSWORD=<your_chosen_password>, and run:`);
    console.log(`   node backend/scripts/seedAdmin.js`);
    console.log(`==================================================`);
    await pool.end();
    return;
  }

  try {
    // 1. Ensure schema and table exist
    await initDb();

    const tableName = `${schemaName}.tbl_users`;

    // 2. Check if admin email already exists in optibuy.tbl_users
    const userCheck = await pool.query(
      `SELECT user_id, email, role FROM ${tableName} WHERE LOWER(email) = $1`,
      [adminEmail]
    );

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    if (userCheck.rows.length > 0) {
      const existingUser = userCheck.rows[0];
      if (existingUser.role !== 'ADMIN') {
        console.log(`[OptiBuy Admin Seed] Updating existing user (${adminEmail}) role from '${existingUser.role}' to 'ADMIN'.`);
      } else {
        console.log(`[OptiBuy Admin Seed] Admin user (${adminEmail}) already exists. Updating password hash.`);
      }

      await pool.query(
        `UPDATE ${tableName}
         SET password_hash = $1, role = 'ADMIN', status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [passwordHash, existingUser.user_id]
      );

    } else {
      // 3. Create new Admin record
      await pool.query(
        `INSERT INTO ${tableName} (full_name, email, phone, password_hash, role, status)
         VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVE')`,
        ['OptiBuy Admin', adminEmail, '+1 (555) 000-8888', passwordHash]
      );

      console.log(`[OptiBuy Admin Seed] SUCCESS: Created new Admin account for ${adminEmail}.`);
    }

    console.log(`==================================================`);
    console.log(`✅ [OptiBuy Admin Seed] Admin Account Setup Complete!`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Role:  ADMIN`);
    console.log(`   Target Table: ${tableName}`);
    console.log(`==================================================`);

  } catch (error) {
    console.error(`❌ [OptiBuy Admin Seed Error]`, error.message);
  } finally {
    await pool.end();
  }
};

seedAdmin();
