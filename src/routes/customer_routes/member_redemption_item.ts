// src/routes/member.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
// import { authMiddleware } from '../middleware/authMiddleware';

import {memberAuthMiddleware} from '../../middleware/memberAuthMiddleware';

import getMemberRedemptionItemList from '../../controllers/member_controllers/member_redemption_item/get_member_redemption_item_list';
import getMemberRedemptionItemDetail from '../../controllers/member_controllers/member_redemption_item/get_member_redemption_item_detail';


import { HTTPException } from 'hono/http-exception'

// Import other controllers as needed

const memberRedemptionItemRouter = new Hono();

memberRedemptionItemRouter.use('*', memberAuthMiddleware); // Protect all member routes


// GET /member - Retrieve all members
memberRedemptionItemRouter.get('/get_member_redemption_item_list', memberAuthMiddleware, async (c: Context) => {
  try {
    console.log('get_member_redemption_item_list route begin');
    
    const data = await getMemberRedemptionItemList(c);
    console.log('get_member_redemption_item_list route done');
    return c.json(data);
  } catch (error) {
    console.log('get_member_redemption_item_list route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

// GET /member/get_member_detail/:memberPhone - Retrieve member details by phone
memberRedemptionItemRouter.get('/get_member_redemption_item_detail/:redemption_item_id',memberAuthMiddleware, async (c: Context) => {
  try {
    console.log('get_member_redemption_item_detail route begin');
    

    const data = await getMemberRedemptionItemDetail(c);
    console.log('get_member_redemption_item_detail route done');
    return c.json(data);
  } catch (error: any) {
    console.log('get_member_redemption_item_detail end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});

// memberDiscountCodeRouter.post('/post_new_member', async (c: Context) => {
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

//   memberDiscountCodeRouter.put('/put_suspend_membership/:memberPhone', async (c: Context) => {
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

//   memberDiscountCodeRouter.put('/put_reactivate_membership/:memberPhone', async (c: Context) => {
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

//   memberDiscountCodeRouter.put('/put_change_member_detail/:memberPhone', async (c: Context) => {
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



export default memberRedemptionItemRouter;