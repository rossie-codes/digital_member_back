// src/routes/membership_tier.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
import { adminAuthMiddleware } from '../../middleware/adminAuthMiddleware';

import postMemberPointRule from '../../controllers/admin_controllers/point_setting/post_member_point_rule';

const pointSettingRouter = new Hono();

pointSettingRouter.use("*", adminAuthMiddleware); // Protect all member routes


// pointSettingRouter.get('/get_member_point_rule', async (c: Context) => {
//     try {
//         console.log('get_member_point_rule route begin');
//         const data = await getMemberPointRule(c)
//         console.log('get_member_point_rule route done');
//         return c.json(data);
//     } catch (error) {
//         // Let Hono’s `onError` handle the error
//         throw error;
//     }
// });



pointSettingRouter.post('/post_member_point_earning_record', async (c: Context) => {
    try {
        console.log('post_member_point_earning_record route begin')
        const data = await postMemberPointRule(c)
        // console.log(data)
        console.log('post_member_point_earning_record route done')
        return c.json(data);
    } catch (error) {
        // Let Hono’s `onError` handle the error
        throw error;
    }
});







export default pointSettingRouter;