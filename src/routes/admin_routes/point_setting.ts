// src/routes/membership_tier.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
import { adminAuthMiddleware } from '../../middleware/adminAuthMiddleware';

import getMemberPointRule from '../../controllers/admin_controllers/point_setting/get_member_point_rule';

import postMembershipBasicSetting from '../../controllers/admin_controllers/membership_tier/post_membership_basic_setting';
import postMemberPointRule from '../../controllers/admin_controllers/point_setting/post_member_point_rule';
// Import other controllers as needed

const pointSettingRouter = new Hono();

pointSettingRouter.use("*", adminAuthMiddleware); // Protect all member routes


pointSettingRouter.get('/get_member_point_rule', async (c: Context) => {
    try {
        console.log('get_member_point_rule route begin');
        const data = await getMemberPointRule(c)
        console.log('get_member_point_rule route done');
        return c.json(data);
    } catch (error) {
        // Let Hono’s `onError` handle the error
        throw error;
    }
});


pointSettingRouter.post('/post_member_point_rule', async (c: Context) => {
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


export default pointSettingRouter;