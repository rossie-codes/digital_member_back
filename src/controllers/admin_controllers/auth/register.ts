// src/controllers/auth/register.ts

import type { Context } from 'hono';
import { pool } from '../../db';
import bcrypt from 'bcryptjs';

export async function registerUser(c: Context) {
  try {
    const { phone, password, name, referrer } = await c.req.json();

    if (!phone || !password || !name ) {
      return c.json({ error: 'Name, phone, and password are required' }, 400);
    }

    // Check if user already exists
    const userExistsResult = await pool.query('SELECT * FROM member WHERE member_phone = $1', [phone]);

    if (userExistsResult.rows.length > 0) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Check if user already exists
    const referrerExistsResult = await pool.query('SELECT * FROM member WHERE member_phone = $1', [referrer]);

    if (referrerExistsResult.rows.length = 0) {
      return c.json({ error: 'referrer not exists' }, 400);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the user into the database
    const result = await pool.query(
      'INSERT INTO member_login (name, member_phone, password) VALUES ($1, $2, $3) RETURNING id, name, member_phone',
      [name, phone, hashedPassword]
    );

    const newUser = result.rows[0];

    return c.json({ message: 'User registered successfully', user: newUser }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}