// src/middleware/adminAuthMiddleware.ts

import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { validator } from 'hono/validator'
import { getCookie, setCookie } from 'hono/cookie'

const MEMBI_ADMIN_SECRET = process.env.MEMBI_ADMIN_SECRET || 'admin';

export const adminAuthMiddleware = async (c: Context, next: Next) => {

  // const membi_admin_token = c.req.cookie('membi_admin_token');

  const membi_admin_token = getCookie(c, 'membi_admin_token');

  if (!membi_admin_token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  console.log('membi_admin_token', membi_admin_token);
  
  // console.log('membi_admin_token', membi_admin_token);
  try {
    const decoded = jwt.verify(membi_admin_token, MEMBI_ADMIN_SECRET);
    c.set('user', decoded);

    console.log('decoded', decoded);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};