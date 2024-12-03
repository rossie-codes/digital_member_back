// src/controllers/admin_controllers/auth/admin_logout.ts

import type { Context } from 'hono';
import { serialize } from 'cookie';

export async function logoutAdmin(c: Context) {

  console.log('Logging out admin...');

  // Clear the token cookie
  // const cookie = serialize('token', '', {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'strict',
  //   expires: new Date(0), // Set expiry date in the past
  //   path: '/',
  // });

  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Change from 'strict' to 'lax'
    maxAge: 1, // 1 secord
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.up.railway.app' : undefined,
  });


  c.header('Set-Cookie', cookie);

  console.log('Logged out successfully');
  
  return c.json({ message: 'Logged out successfully' }, 200);
}