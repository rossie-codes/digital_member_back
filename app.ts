// app.ts

import { Hono, type Context } from 'hono'
import { cors } from 'hono/cors'
import memberRouter from '../digital_member_backend_2/src/routes/member';
import membershipTierRouter from '../digital_member_backend_2/src/routes/membership_tier'
import adminSettingRouter from '../digital_member_backend_2/src/routes/admin_setting'
import redemptionItemRouter from './src/routes/redemption_item'
import discountCodeRouter from './src/routes/discount_code'


const app = new Hono();
// Apply global CORS middleware
app.use('*', cors({
  origin: 'http://localhost:3001', // Adjust the origin as needed
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  credentials: true,
}));

// Error handling middleware
app.onError((err: any, c: Context) => {
  console.error('Error occurred:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});


// Mount sub-routers
app.route('/member', memberRouter); // Handles /member and nested routes
app.route('/membership_tier', membershipTierRouter); // Handles /membership_tier and nested routes
app.route('/admin_setting', adminSettingRouter);
app.route('/redemption_item', redemptionItemRouter);
app.route('/discount_code', discountCodeRouter);





export default app;