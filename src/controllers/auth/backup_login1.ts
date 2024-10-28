// 完成 auth，用 localstorage save token


// 想轉成 cookies



// import type { Context } from 'hono';
// import { pool } from '../db';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Store your secret securely

// export async function loginUser(c: Context) {
//   try {
//     const { phone, password } = await c.req.json();

//     if (!phone || !password) {
//       return c.json({ error: 'phone and password are required' }, 400);
//     }

//     // Get the user from the database
//     const result = await pool.query('SELECT * FROM member_login WHERE member_phone = $1', [phone]);

//     if (result.rows.length === 0) {
//       return c.json({ error: 'Invalid credentials' }, 401);
//     }

//     const user = result.rows[0];

//     // Compare the password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return c.json({ error: 'Invalid credentials' }, 401);
//     }

//     // Generate a JWT token
//     const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

//     // Return the token
//     return c.json({ token }, 200);
//   } catch (error) {
//     console.error('Login error:', error);
//     return c.json({ error: 'Internal server error' }, 500);
//   }
// }