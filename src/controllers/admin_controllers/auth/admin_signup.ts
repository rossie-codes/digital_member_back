// src/controllers/auth/signup.ts

import type { Context } from 'hono';
import { pool } from '../../db';
import bcrypt from 'bcryptjs';

export async function signupAdmin(c: Context) {
  try {
    console.log('function signupAdmin start')
    const { admin_name, admin_password } = await c.req.json();

    console.log('function signupAdmin start', admin_name, admin_password )


    if (!admin_name || !admin_password) {
        console.log('function signupAdmin need input')
      return c.json({ error: 'Name, phone number, and admin_password are required' }, 400);
    }

    // Check if any admins exist
    const adminCountResult = await pool.query('SELECT COUNT(*) FROM admin_login');
    const adminCount = parseInt(adminCountResult.rows[0].count, 10);

    if (adminCount > 0) {
        console.log('function signupAdmin exists')
      return c.json({ error: 'Admin account already exists' }, 403);
    }

    // Hash the admin_password
    // const salt = await bcrypt.genSalt(10);
    // const passwordHash = await bcrypt.hash(admin_password, salt);

    const adminPasswordHash = await Bun.password.hash(admin_password);

    // Insert the admin into the database
    const result = await pool.query(
      'INSERT INTO admin_login (admin_name, password_hash) VALUES ($1, $2, $3) RETURNING login_id, admin_name',
      [admin_name, adminPasswordHash]
    );

    const newAdmin = result.rows[0];
    console.log('function signupAdmin done')

    return c.json({ message: 'Admin account created successfully', admin: newAdmin }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}