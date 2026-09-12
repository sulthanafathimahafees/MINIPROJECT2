import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';

async function checkUsers() {
  const users = await query('SELECT user_id, email, password_hash, role, status FROM public.users');
  const candidates = ['admin@123', 'sales@123', 'customer@123', 'password123', 'adminpassword', 'salespassword', 'customerpassword'];
  
  for (const u of users.rows) {
    let matched = null;
    for (const c of candidates) {
      if (u.password_hash && await bcrypt.compare(c, u.password_hash)) {
        matched = c;
        break;
      }
    }
    console.log(`User: ${u.email} | Role: ${u.role} | Status: ${u.status} | Password: ${matched || 'UNKNOWN'}`);
  }

  // Also check optibuy.tbl_users
  const tblUsers = await query('SELECT user_id, email, password_hash, role, status FROM optibuy.tbl_users WHERE email IN (\'optibuyadmin@gmail.com\', \'neeva@gmail.com\', \'aryadileep@gmail.com\')');
  for (const u of tblUsers.rows) {
    let matched = null;
    for (const c of candidates) {
      if (u.password_hash && await bcrypt.compare(c, u.password_hash)) {
        matched = c;
        break;
      }
    }
    console.log(`tbl_user: ${u.email} | Role: ${u.role} | Status: ${u.status} | Password: ${matched || 'UNKNOWN'}`);
  }

  process.exit(0);
}

checkUsers();
