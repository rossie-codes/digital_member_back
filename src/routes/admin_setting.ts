// src/routes/membership_tier.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
import { authMiddleware } from '../middleware/authMiddleware';

import getMembershipTierSetting from '../controllers/membership_tier/get_membership_tier_setting';
import postAdminSetting from '../controllers/admin_setting/post_admin_setting';
import postMemberPointRule from '../controllers/admin_setting/post_member_point_rule';
// Import other controllers as needed

const adminSettingRouter = new Hono();

// adminSettingRouter.use('*', authMiddleware); // Protect all member routes

// GET /member - Retrieve all members
adminSettingRouter.get('/get_membership_tier_setting', async (c: Context) => {
    try {
        console.log('get_membership_tier_setting route begin');
        const data = await getMembershipTierSetting()
        console.log('get_membership_tier_setting route done');
        return c.json(data);
    } catch (error) {
        // Let Hono’s `onError` handle the error
        throw error;
    }
});


adminSettingRouter.post('/post_admin_setting', async (c: Context) => {
    try {
        console.log('post_admin_setting route begin')
        const data = await postAdminSetting(c)
        // console.log(data)
        console.log('post_admin_setting route done')
        return c.json(data);
    } catch (error) {
        // Let Hono’s `onError` handle the error
        throw error;
    }
});

adminSettingRouter.post('/post_member_point_rule', async (c: Context) => {
    try {
        console.log('post_member_point_rule route begin')
        const data = await postMemberPointRule(c)
        // console.log(data)
        console.log('post_member_point_rule route done')
        return c.json(data);
    } catch (error) {
        // Let Hono’s `onError` handle the error
        throw error;
    }
});





export default adminSettingRouter;