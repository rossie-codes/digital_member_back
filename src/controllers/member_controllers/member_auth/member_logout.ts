// src/controllers/auth/logout.ts

import type { Context } from 'hono';
import { serialize } from 'cookie';

async function logoutMember(c: Context) {
  console.log('Logging out member...');
  
  // // Clear the token cookie
  // const cookie = serialize('token', '', {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'strict',
  //   expires: new Date(0), // Set expiry date in the past
  //   path: '/',
  // });

  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: false, // Set to false if testing over HTTP
    sameSite: 'lax', // Change from 'strict' to 'lax'
    maxAge: 3600, // 1 hour
    path: '/',
  });


  c.header('Set-Cookie', cookie);

  console.log('Logged out successfully');

  return c.json({ message: 'Logged out successfully' }, 200);
}

export default logoutMember;