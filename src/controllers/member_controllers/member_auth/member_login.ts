// src/controllers/member_controllers/member_auth/member_login.ts

import type { Context } from 'hono';
import { pool } from '../../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Replace with your secret key

async function loginMember(c: Context) {
  console.log('loginUser function begin')
  
  try {
    const { member_phone, member_password } = await c.req.json();

    if (!member_phone || !member_password) {
      return c.json({ error: 'Phone number and member_password are required' }, 400);
    }

    console.log('loginUser function begin, member_phone and password exist.')
    // Get the user from the database
    const result = await pool.query('SELECT * FROM member_login WHERE member_phone = $1', [member_phone]);

    if (result.rows.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

  
    const user = result.rows[0];

    console.log('loginUser function begin, member_phone exist in db.')

    // Compare the member_password
    const isMatch = await bcrypt.compare(member_password, user.member_password_hash);

    console.log('loginUser function begin, member_phone and password correct.')

    if (!isMatch) {
      // Optionally increment failed login attempts
      await pool.query(
        'UPDATE member_login SET failed_login_attempts = failed_login_attempts + 1 WHERE login_id = $1',
        [user.login_id]
      );

      return c.json({ error: 'Invalid credentials' }, 401);
    }
    // Generate a JWT token
    const token = jwt.sign({ memberId: user.member_id }, JWT_SECRET, { expiresIn: '1h' });

    // Update last_login and reset failed_login_attempts
    await pool.query(
      'UPDATE member_login SET last_login = NOW(), failed_login_attempts = 0 WHERE login_id = $1',
      [user.login_id]
    );

    // Set the token as an HTTP-only cookie
    // const cookie = serialize('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    //   sameSite: 'strict',
    //   maxAge: 3600, // 1 hour
    //   path: '/',
    // });

    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: false, // Set to false if testing over HTTP
      sameSite: 'lax', // Change from 'strict' to 'lax'
      maxAge: 3600, // 1 hour
      path: '/',
    });

    c.header('Set-Cookie', cookie);

    console.log('loginUser function done')
    
    return c.json({ message: 'Login successful' }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}


export default loginMember;