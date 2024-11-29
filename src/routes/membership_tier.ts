// src/routes/membership_tier.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
import { authMiddleware } from '../middleware/authMiddleware';

import getMembershipTierSetting from '../controllers/admin_controllers/membership_tier/get_membership_tier_setting';
import getMembershipBasicSetting from '../controllers/admin_controllers/membership_tier/get_membership_basic_setting';

import postMembershipTierSetting from '../controllers/admin_controllers/membership_tier/post_membership_tier_setting';
import postMembershipBasicSetting from '../controllers/admin_controllers/membership_tier/post_membership_basic_setting';

// Import other controllers as needed

const membershipTierRouter = new Hono();

// membershipTierRouter.use('*', authMiddleware); // Protect all member routes


membershipTierRouter.get('/get_membership_basic_setting', async (c: Context) => {
    try {
        console.log('get_membership_tier_setting route begin');
        const data = await getMembershipBasicSetting()
        console.log('get_membership_tier_setting route done');
        return c.json(data);
    } catch (error) {
        // Let Hono’s `onError` handle the error
        throw error;
    }
});

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



membershipTierRouter.post('/post_membership_basic_setting', async (c: Context) => {
    try {
        console.log('post_admin_setting route begin')
        const data = await postMembershipBasicSetting(c)
        // console.log(data)
        console.log('post_admin_setting route done')
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