// src/middleware/authMiddleware.ts

// import type { Context, Next } from 'hono';
// import jwt from 'jsonwebtoken';

// // const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Use the same secret key
// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Use the same secret key

// export async function authMiddleware(c: Context, next: Next) {
//   try {
//     const authHeader = c.req.header('Authorization');

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return c.json({ error: 'No token, authorization denied' }, 401);
//     }

//     const token = authHeader.substring(7, authHeader.length);

//     const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

//     c.set('user', { id: decoded.userId });

//     await next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);
//     return c.json({ error: 'Token is not valid' }, 401);
//   }
// }

import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function authMiddleware(c: Context, next: Next) {
  try {
    const cookieHeader = c.req.header('Cookie');

    if (!cookieHeader) {
      return c.json({ error: 'No token, authorization denied' }, 401);
    }

    const cookies = parse(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return c.json({ error: 'No token, authorization denied' }, 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    c.set('user', { admin_id: decoded.admin_id });

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Token is not valid' }, 401);
  }
}