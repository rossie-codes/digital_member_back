// src/routes/member.ts

import { Hono } from 'hono';
import { type Context } from 'hono';

import {memberAuthMiddleware} from '../../middleware/memberAuthMiddleware';

import getMembershipTierSetting from '../../controllers/member_controllers/member_membership_tier/get_member_membership_tier_setting';


import { HTTPException } from 'hono/http-exception'

// Import other controllers as needed

const memberMembershipTierRouter = new Hono();

memberMembershipTierRouter.use('*', memberAuthMiddleware); // Protect all member routes


// GET /member - Retrieve all members
memberMembershipTierRouter.get('/get_member_membership_tier_setting', memberAuthMiddleware, async (c: Context) => {
  try {
    console.log('get_member_membership_tier_setting route begin');
    
    const data = await getMembershipTierSetting(c);
    console.log('get_member_membership_tier_setting route done');
    return c.json(data);
  } catch (error) {
    console.log('get_member_membership_tier_setting route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});



// // GET /member/get_member_detail/:memberPhone - Retrieve member details by phone
// memberMemberRouter.get('/get_member_detail/:memberPhone', async (c: Context) => {
//   try {
//     console.log('get_member_detail route begin');
    
//     const memberPhone = c.req.param('memberPhone');

//     console.log('memberPhone is: ', memberPhone);
    
//     const data = await getMemberDetail(memberPhone);
//     console.log('get_member_detail route done');
//     return c.json(data);
//   } catch (error: any) {
//     console.log('get_member_detail end in error');
//     if (error.message === 'Member not found') {
//       return c.json({ message: 'Member not found' }, 404);
//     }
//     throw error;
//   }
// });

// memberMemberRouter.post('/post_new_member', async (c: Context) => {
//     try {
//       console.log('post_new_member route begin');
//       const response = await postNewMember(c);
//       console.log('post_new_member route done');

//       return response; // Return the Response directly
//     } catch (error) {
//       console.log('post_new_member route end in error');
//       throw error;
//     }
//   });

//   memberMemberRouter.put('/put_suspend_membership/:memberPhone', async (c: Context) => {
//     try {
//       console.log('put_suspend_membership route begin');
//       const response = await putSuspendMembership(c);
//       console.log('put_suspend_membership route done');

//       return response; // Return the Response directly
//     } catch (error) {
//       console.log('put_suspend_membership route end in error');
//       throw error;
//     }
//   });

//   memberMemberRouter.put('/put_reactivate_membership/:memberPhone', async (c: Context) => {
//     try {
//       console.log('put_reactivate_membership route begin');
//       const response = await putReactivateMembership(c);
//       console.log('put_reactivate_membership route done');

//       return response; // Return the Response directly
//     } catch (error) {
//       console.log('put_suspend_membership route end in error');
//       throw error;
//     }
//   });

//   memberMemberRouter.put('/put_change_member_detail/:memberPhone', async (c: Context) => {
//     try {
//       console.log('put_change_member_detail route begin');
//       const response = await putChangeMemberDetail(c);
//       console.log('put_change_member_detail route done');

//       return response; // Return the Response directly
//     } catch (error) {
//       console.log('put_suspend_membership route end in error');
//       throw error;
//     }
//   });



export default memberMembershipTierRouter;