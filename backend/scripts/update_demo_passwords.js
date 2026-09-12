import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';

async function updatePasswords() {
  const hash = await bcrypt.hash('password123', 10);
  const res1 = await query('UPDATE public.users SET password_hash = $1 WHERE email = ANY($2)', [
    hash,
    ['aryadileep@gmail.com', 'neeva@gmail.com']
  ]);
  const res2 = await query('UPDATE optibuy.tbl_users SET password_hash = $1 WHERE email = ANY($2)', [
    hash,
    ['aryadileep@gmail.com', 'neeva@gmail.com']
  ]);
  console.log(`Updated public.users (${res1.rowCount}) and optibuy.tbl_users (${res2.rowCount}) to password123`);
  process.exit(0);
}

updatePasswords().catch(err => {
  console.error(err);
  process.exit(1);
});
