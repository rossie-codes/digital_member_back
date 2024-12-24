// src/app.ts

import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import adminAuthRouter from './src/routes/admin_routes/admin_auth';
import adminSettingRouter from './src/routes/admin_routes/admin_setting';
import memberRouter from './src/routes/admin_routes/member';
import membershipTierRouter from './src/routes/admin_routes/membership_tier';
import pointSettingRouter from './src/routes/admin_routes/point_setting';
import pointEarningRecordRouter from './src/routes/admin_routes/point_earning_record';
import redemptionItemRouter from './src/routes/admin_routes/redemption_item';
import discountCodeRouter from './src/routes/admin_routes/discount_code';
import broadcastSettingRouter from './src/routes/admin_routes/broadcast_setting';
import dashboardRouter from './src/routes/admin_routes/dashboard';

import customerAuthRouter from './src/routes/customer_routes/customer_auth';
import memberMemberRouter from './src/routes/customer_routes/member_member';
import memberDiscountCodeRouter from './src/routes/customer_routes/member_discount_code';
import memberRedemptionItemRouter from './src/routes/customer_routes/member_redemption_item';
import memberMemberOrderRouter from './src/routes/customer_routes/member_member_order';
import memberMembershipTierRouter from './src/routes/customer_routes/member_membership_tier';

import tenantRouter from './src/routes/tenant_routes/tenant';

import { config } from './src/config'; // Adjust the path as needed

const app = new Hono();

// Apply global CORS middleware
// app.use('*', cors({
//   origin: config.allowedOrigins, // Always a string array
//   // origin: '*', // Always a string array
//   // origin: process.env.ALLOWED_ORIGINS, // Always a string array
//   // origin: 'https://digitalmemberfront-production.up.railway.app',
//   // origin: 'http://localhost:3001',
//   allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowHeaders: ['Content-Type'],
//   credentials: true,
// }));



// const allowedOrigins = [
//   process.env.ALLOWED_ORIGINS,
// /^https:\/\/.*\.railway\.app$/, // Matches any subdomain of railway.app
// "http://localhost:3000",
// "http://localhost:3002"

// ];


const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => {
  // Check if origin is a regex pattern (starts and ends with /)
  if (origin.startsWith('/') && origin.endsWith('/')) {
    // Remove slashes and create RegExp
    return new RegExp(origin.slice(1, -1));
  }
  return origin;
});


app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*';

    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    return isAllowed ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


// Error handling middleware
app.onError((err: any, c: Context) => {
  console.error('Error occurred:', err);

  // Check if the error is an instance of Hono's HTTPException
  if (err instanceof Error && 'status' in err) {
    return c.json({ error: err.message }, err.status || 500);
  }

  return c.json({ error: 'Internal Server Error' }, 500);
});

// Mount sub-routers
app.route('/admin_auth', adminAuthRouter);
app.route('/admin_setting', adminSettingRouter);
app.route('/member', memberRouter); // Handles /member and nested routes
app.route('/membership_tier', membershipTierRouter); // Handles /membership_tier and nested routes
app.route('/point_setting', pointSettingRouter);
app.route('/point_earning_record', pointEarningRecordRouter);
app.route('/redemption_item', redemptionItemRouter);
app.route('/discount_code', discountCodeRouter);
app.route('/broadcast_setting', broadcastSettingRouter);
app.route('/dashboard', dashboardRouter);

app.route('/customer/customer_auth', customerAuthRouter);
app.route('/customer/member_member', memberMemberRouter);
app.route('/customer/member_discount_code', memberDiscountCodeRouter);
app.route('/customer/member_redemption_item', memberRedemptionItemRouter);
app.route('/customer/member_member_order', memberMemberOrderRouter);
app.route('/customer/member_membership_tier', memberMembershipTierRouter);

app.route('/tenant/tenant', tenantRouter);



export default app;