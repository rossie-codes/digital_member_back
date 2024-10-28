// src/controllers/auth/check_auth.ts


import type { Context } from 'hono';

export async function checkAuth(c: Context) {
  const user = c.get('user');
  if (user) {
    return c.json({ isAuthenticated: true }, 200);
  } else {
    return c.json({ isAuthenticated: false }, 200);
  }
}