// src/middleware/memberAuthMiddleware.ts

import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { validator } from 'hono/validator'
import { getCookie, setCookie } from 'hono/cookie'

const MEMBI_CUSTOMER_SECRET = process.env.MEMBI_CUSTOMER_SECRET || 'customer';

export const memberAuthMiddleware = async (c: Context, next: Next) => {

  // const membi_m_token = c.req.cookie('membi_m_token');

  const membi_m_token = getCookie(c, 'membi_m_token');

  if (!membi_m_token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // console.log('membi_m_token', membi_m_token);
  try {
    const decoded = jwt.verify(membi_m_token, MEMBI_CUSTOMER_SECRET);
    c.set('user', decoded);

    console.log('decoded', decoded);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};