// src/routes/member.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
// import { authMiddleware } from '../middleware/authMiddleware';

import {memberAuthMiddleware} from '../../middleware/memberAuthMiddleware';

import getMemberMemberOrderList from '../../controllers/member_controllers/member_member_order/get_member_member_order_list.ts';
import getMemberMemberOrderCard from '../../controllers/member_controllers/member_member_order/get_member_member_order_card.ts';
import getMemberMemberOrderDetail from '../../controllers/member_controllers/member_member_order/get_member_member_order_detail.ts';

import getMemberRedemptionItemDetail from '../../controllers/member_controllers/member_redemption_item/get_member_redemption_item_detail';
import getMemberRedemptionItemSetting from '../../controllers/member_controllers/member_redemption_item/get_member_redemption_item_setting';

import { HTTPException } from 'hono/http-exception'

// Import other controllers as needed

const memberMemberOrderRouter = new Hono();

memberMemberOrderRouter.use('*', memberAuthMiddleware); // Protect all member routes


// GET /member - Retrieve all members
memberMemberOrderRouter.get('/get_member_member_order_list', memberAuthMiddleware, async (c: Context) => {
  try {
    console.log('get_member_member_order_list route begin');
    
    const data = await getMemberMemberOrderList(c);
    console.log('get_member_member_order_list route done');
    return c.json(data);
  } catch (error) {
    console.log('get_member_member_order_list route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

// GET /member - Retrieve all members
memberMemberOrderRouter.get('/get_member_member_order_card', memberAuthMiddleware, async (c: Context) => {
  try {
    console.log('get_member_member_order_card route begin');
    
    const data = await getMemberMemberOrderCard(c);
    console.log('get_member_member_order_card route done');
    return c.json(data);
  } catch (error) {
    console.log('get_member_member_order_card route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});


memberMemberOrderRouter.get('/get_member_member_order_detail/:order_id',memberAuthMiddleware, async (c: Context) => {
  try {
    console.log('get_member_member_order_detail route begin');
    

    const data = await getMemberMemberOrderDetail(c);
    console.log('get_member_member_order_detail route done');
    return c.json(data);
  } catch (error: any) {
    console.log('get_member_member_order_detail end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});


// memberMemberOrderRouter.get('/get_member_redemption_item_setting', memberAuthMiddleware, async (c: Context) => {
//   try {
//     console.log('get_member_redemption_item_setting route begin');
    
//     const data = await getMemberRedemptionItemSetting(c);
//     console.log('get_member_redemption_item_setting route done');
//     return c.json(data);
//   } catch (error) {
//     console.log('get_member_redemption_item_setting route end in error');
//     // Let Hono’s `onError` handle the error
//     throw error;
//   }
// });


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



export default memberMemberOrderRouter;