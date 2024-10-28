import type { Context } from 'hono';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Replace with your secret key

export async function loginUser(c: Context) {
  console.log('loginUser function begin')
  
  try {
    const { admin_phone, password } = await c.req.json();

    console.log('loginUser function begin', admin_phone, password )

    if (!admin_phone || !password) {
      return c.json({ error: 'Phone number and password are required' }, 400);
    }

    // Get the user from the database
    const result = await pool.query('SELECT * FROM admin_login WHERE admin_phone = $1', [admin_phone]);

    if (result.rows.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = result.rows[0];

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    console.log('loginUser function admin_phone and password passed')

    if (!isMatch) {
      // Optionally increment failed login attempts
      await pool.query(
        'UPDATE member_login SET failed_login_attempts = failed_login_attempts + 1 WHERE login_id = $1',
        [user.login_id]
      );

      return c.json({ error: 'Invalid credentials' }, 401);
    }
    console.log('loginUser function handle token')
    // Generate a JWT token
    const token = jwt.sign({ memberId: user.member_id }, JWT_SECRET, { expiresIn: '1h' });

    // Update last_login and reset failed_login_attempts
    await pool.query(
      'UPDATE admin_login SET last_login = NOW(), failed_login_attempts = 0 WHERE login_id = $1',
      [user.login_id]
    );

    console.log('loginUser function handle cookies')

    // Set the token as an HTTP-only cookie
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: 60, // 1 hour
      path: '/',
    });

    c.header('Set-Cookie', cookie);

    console.log('loginUser function handle cookies', cookie)

    // Return success response without token in body
    return c.json({ message: 'Login successful' }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}