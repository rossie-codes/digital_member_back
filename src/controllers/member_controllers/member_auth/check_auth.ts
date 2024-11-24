
// src/controllers/member_controllers/member_auth/check_auth.ts

import type { Context } from 'hono';

async function checkAuth(c: Context) {
  console.log('check auth success');
  return c.json({ message: 'Authenticated' }, 200);
}

export default checkAuth;