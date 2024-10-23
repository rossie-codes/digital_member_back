// src/app.ts

import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import memberRouter from './src/routes/member';
import membershipTierRouter from './src/routes/membership_tier';
import adminSettingRouter from './src/routes/admin_setting';
import redemptionItemRouter from './src/routes/redemption_item';
import discountCodeRouter from './src/routes/discount_code';
import { config } from './src/config'; // Adjust the path as needed

const app = new Hono();

// Apply global CORS middleware
app.use('*', cors({
  // origin: config.allowedOrigins, // Always a string array
  // origin: 'https://digitalmemberfront-production.up.railway.app',
  origin: 'http://localhost:3001',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  credentials: true,
}));

// Error handling middleware
app.onError((err: any, c: Context) => {
  console.error('config.allowedOrigins is!!!!!!!!!!!!!!!', config.allowedOrigins);
  console.error('Error occurred:', err);

  // Check if the error is an instance of Hono's HTTPException
  if (err instanceof Error && 'status' in err) {
    return c.json({ error: err.message }, err.status || 500);
  }

  return c.json({ error: 'Internal Server Error' }, 500);
});

// Mount sub-routers
app.route('/member', memberRouter); // Handles /member and nested routes
app.route('/membership_tier', membershipTierRouter); // Handles /membership_tier and nested routes
app.route('/admin_setting', adminSettingRouter);
app.route('/redemption_item', redemptionItemRouter);
app.route('/discount_code', discountCodeRouter);

export default app;