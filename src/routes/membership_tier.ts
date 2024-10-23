// src/routes/membership_tier.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
import { authMiddleware } from '../middleware/authMiddleware';

import getMembershipTierSetting from '../controllers/membership_tier/get_membership_tier_setting';
import postMembershipTierSetting from '../controllers/membership_tier/post_membership_tier_setting';
// Import other controllers as needed

const membershipTierRouter = new Hono();

// membershipTierRouter.use('*', authMiddleware); // Protect all member routes

// GET /member - Retrieve all members
membershipTierRouter.get('/get_membership_tier_setting', async (c: Context) => {
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


membershipTierRouter.post('/post_membership_tier_setting', async (c: Context) => {
    try {
        // console.log('here it is: ', c.req.json)
        console.log('post_membership_tier_setting route begin');
        const data = await postMembershipTierSetting(c)
        console.log('post_membership_tier_setting route done');
        // console.log(data)
        return c.json(data);
    } catch (error) {
        // Let Hono’s `onError` handle the error
        throw error;
    }
});





export default membershipTierRouter;