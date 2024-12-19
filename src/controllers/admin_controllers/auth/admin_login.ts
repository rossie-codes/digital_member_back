// src/controllers/admin_controllers/auth/admin_login.ts

import type { Context } from 'hono';
// import { pool } from '../../db';
import { getTenantClient } from "../../db";
// import bcrypt from 'bcryptjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const MEMBI_ADMIN_SECRET = process.env.MEMBI_ADMIN_SECRET || 'MEMBI_ADMIN_SECRET'; // Replace with your secret key

export async function loginAdmin(c: Context) {
  console.log('loginAdmin function begin')
  

  
  const tenant = c.get("tenant");
  // const tenant = 'https://mm9_client'
  // const tenant = 'https://membi-admin'

  console.log("tenant", tenant);

  const pool = await getTenantClient(tenant);


  try {
    const { admin_name, admin_password } = await c.req.json();

    console.log('loginAdmin function begin', admin_name, admin_password )

    if (!admin_name || !admin_password) {
      return c.json({ error: 'Phone number and password are required' }, 400);
    }

    // Get the user from the database
    const result = await pool.query('SELECT * FROM admin_login WHERE admin_name = $1', [admin_name]);

    if (result.rows.length === 0) {
      console.log('loginAdmin function admin_name not found')
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = result.rows[0];

    console.log('loginAdmin function admin_name found', user)

    // Compare the password
    // const isMatch = await bcrypt.compare(admin_password, user.admin_password_hash);

    const isMatch = await Bun.password.verify(admin_password, user.admin_password_hash);


    console.log('loginAdmin function admin_name and password passed')

    if (!isMatch) {
      // Optionally increment failed login attempts
      await pool.query(
        'UPDATE admin_login SET failed_login_attempts = failed_login_attempts + 1 WHERE login_id = $1',
        [user.login_id]
      );

      return c.json({ error: 'Invalid credentials' }, 401);
    }
    console.log('loginAdmin function handle membi_admin_token')
    // Generate a JWT membi_admin_token
    const membi_admin_token = jwt.sign({ adminId: user.admin_id }, MEMBI_ADMIN_SECRET, { expiresIn: '10h' });

    // Update last_login and reset failed_login_attempts
    await pool.query(
      'UPDATE admin_login SET last_login = NOW(), failed_login_attempts = 0 WHERE login_id = $1',
      [user.login_id]
    );

    // Set the membi_admin_token as an HTTP-only cookie
    const cookie = serialize('membi_admin_token', membi_admin_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax', // Change from 'strict' to 'lax'
      maxAge: 36000, // 10 hour
      // maxAge: 30, // 1 hour
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.up.railway.app' : undefined,
    });

    c.header('Set-Cookie', cookie);
    

    console.log('loginAdmin function done cookies', cookie)

    // Return success response without membi_admin_token in body
    return c.json({ message: 'Login successful' }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  } finally {  
    pool.release();
  }
}