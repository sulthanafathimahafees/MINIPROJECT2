import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { normalizeRole } from '../middleware/auth.js';

async function verifyAuth() {
  console.log('==================================================');
  console.log('🔐 OPTIBUY ROLE-BASED AUTH VERIFICATION');
  console.log('==================================================');

  // 1. Verify Admin Account in DB
  const adminRes = await query(
    'SELECT user_id, full_name, email, role, status FROM public.users WHERE LOWER(email) = $1',
    ['optibuyadmin@gmail.com']
  );
  if (adminRes.rows.length === 0) throw new Error('Admin not found in DB');
  const admin = adminRes.rows[0];
  console.log('✅ Admin Account Verified:');
  console.log(`   ID: ${admin.user_id} | Email: ${admin.email} | DB Role: ${admin.role} | Normalized: ${normalizeRole(admin.role)} | Status: ${admin.status}`);

  // 2. Verify Sales Executive Account in DB
  const salesRes = await query(
    'SELECT user_id, full_name, email, role, status FROM public.users WHERE LOWER(email) = $1',
    ['neeva@gmail.com']
  );
  if (salesRes.rows.length === 0) throw new Error('Sales Executive not found in DB');
  const sales = salesRes.rows[0];
  console.log('✅ Sales Executive Account Verified:');
  console.log(`   ID: ${sales.user_id} | Email: ${sales.email} | DB Role: ${sales.role} | Normalized: ${normalizeRole(sales.role)} | Status: ${sales.status}`);

  // 3. Verify Customer Account in DB
  const custRes = await query(
    'SELECT user_id, full_name, email, role, status FROM public.users WHERE LOWER(email) = $1',
    ['aryadileep@gmail.com']
  );
  if (custRes.rows.length === 0) throw new Error('Customer not found in DB');
  const cust = custRes.rows[0];
  console.log('✅ Customer Account Verified:');
  console.log(`   ID: ${cust.user_id} | Email: ${cust.email} | DB Role: ${cust.role} | Normalized: ${normalizeRole(cust.role)} | Status: ${cust.status}`);

  // 4. Role normalization test for all supported aliases
  console.log('\n--- Role Normalization Matrix ---');
  const testRoles = [
    { input: 'CUSTOMER', expected: 'CUSTOMER' },
    { input: 'SALES_EXECUTIVE', expected: 'SALES_PERSON' },
    { input: 'SALES_PERSON', expected: 'SALES_PERSON' },
    { input: 'SALES', expected: 'SALES_PERSON' },
    { input: 'ADMIN', expected: 'ADMIN' }
  ];

  for (const t of testRoles) {
    const norm = normalizeRole(t.input);
    if (norm !== t.expected) {
      throw new Error(`Normalization failed for ${t.input}: expected ${t.expected}, got ${norm}`);
    }
    console.log(`   ${t.input.padEnd(16)} -> ${norm} [MATCH]`);
  }

  // 5. JWT Signing and Expiration Handling
  console.log('\n--- JWT Session Token Validation ---');
  const JWT_SECRET = process.env.JWT_SECRET || 'optibuy_secure_jwt_secret_key_2026';
  for (const t of testRoles) {
    const token = jwt.sign(
      { userId: 100, email: 'test@optibuy.com', role: normalizeRole(t.input), status: 'ACTIVE' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`   Token for ${t.input.padEnd(16)} verified: userId=${decoded.userId}, role=${decoded.role}`);
  }

  console.log('\n==================================================');
  console.log('🎉 ALL ROLE-BASED AUTH CHECKS PASSED SUCCESSFULLY');
  console.log('==================================================');
  process.exit(0);
}

verifyAuth().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
