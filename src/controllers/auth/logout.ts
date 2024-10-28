// src/controllers/auth/logout.ts

import type { Context } from 'hono';
import { serialize } from 'cookie';

export async function logoutUser(c: Context) {
  // Clear the token cookie
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0), // Set expiry date in the past
    path: '/',
  });

  c.header('Set-Cookie', cookie);

  return c.json({ message: 'Logged out successfully' }, 200);
}