// src/routes/member.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
import { adminAuthMiddleware } from '../../middleware/adminAuthMiddleware';

import getDashboardInfo from '../../controllers/admin_controllers/report/dashboard/get_dashboard_info';

const dashboardRouter = new Hono();

dashboardRouter.use("*", adminAuthMiddleware); // Protect all member routes

dashboardRouter.get('/get_dashboard_info', async (c: Context) => {
  try {
    console.log('get_dashboard_info route begin');
    const data = await getDashboardInfo(c);
    console.log('get_dashboard_info route done');
    return c.json(data);
  } catch (error) {
    console.log('get_dashboard_info route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});


export default dashboardRouter;