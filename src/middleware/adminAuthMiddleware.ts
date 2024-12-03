// src/middleware/adminAuthMiddleware.ts

import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { validator } from 'hono/validator'
import { getCookie, setCookie } from 'hono/cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const memberAuthMiddleware = async (c: Context, next: Next) => {

  // const token = c.req.cookie('token');

  const token = getCookie(c, 'token');

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // console.log('token', token);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.set('user', decoded);

    console.log('decoded', decoded);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};