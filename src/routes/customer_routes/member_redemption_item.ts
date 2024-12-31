// src/routes/member.ts

import { Hono } from 'hono';
import { type Context } from 'hono';

import {memberAuthMiddleware} from '../../middleware/memberAuthMiddleware';

import getMemberRedemptionItemRecordList from '../../controllers/member_controllers/member_redemption_item/get_member_redemption_item_record_list.ts';
import getMemberRedemptionItemRecordDetail from '../../controllers/member_controllers/member_redemption_item/get_member_redemption_item_record_detail.ts';
import getMemberExpiredRedemptionItemRecordList from '../../controllers/member_controllers/member_redemption_item/get_member_expired_redemption_item_record_list.ts';
import getMemberExpiredRedemptionItemRecordDetail from '../../controllers/member_controllers/member_redemption_item/get_member_expired_redemption_item_record_detail.ts';
import getMemberRedemptionItemSettingDetail from '../../controllers/member_controllers/member_redemption_item/get_member_redemption_item_setting_detail.ts';
import getMemberRedemptionItemSetting from '../../controllers/member_controllers/member_redemption_item/get_member_redemption_item_setting';


import postMemberRedemptionItemRedeem from '../../controllers/member_controllers/member_redemption_item/post_member_redemption_item_redeem.ts';

import { HTTPException } from 'hono/http-exception'

// Import other controllers as needed

const memberRedemptionItemRouter = new Hono();

memberRedemptionItemRouter.use('*', memberAuthMiddleware); // Protect all member routes


// GET /member - Retrieve all members
memberRedemptionItemRouter.get('/get_member_redemption_item_record_list', async (c: Context) => {
  try {
    console.log('get_member_redemption_item_record_list route begin');
    
    const data = await getMemberRedemptionItemRecordList(c);
    console.log('get_member_redemption_item_record_list route done');
    return c.json(data);
  } catch (error) {
    console.log('get_member_redemption_item_record_list route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});



memberRedemptionItemRouter.get('/get_member_redemption_item_record_detail/:redemption_record_id',memberAuthMiddleware, async (c: Context) => {
  try {
    console.log('get_member_redemption_item_record_detail route begin');
    

    const data = await getMemberRedemptionItemRecordDetail(c);
    console.log('get_member_redemption_item_record_detail route done');
    return c.json(data);
  } catch (error: any) {
    console.log('get_member_redemption_item_record_detail end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});


memberRedemptionItemRouter.get('/get_member_expired_redemption_item_record_list', async (c: Context) => {
  try {
    console.log('get_member_expired_redemption_item_record_list route begin');
    
    const data = await getMemberExpiredRedemptionItemRecordList(c);
    console.log('get_member_expired_redemption_item_record_list route done');
    return c.json(data);
  } catch (error) {
    console.log('get_member_expired_redemption_item_record_list route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

memberRedemptionItemRouter.get('/get_member_expired_redemption_item_record_detail/:redemption_record_id',memberAuthMiddleware, async (c: Context) => {
  try {
    console.log('get_member_expired_redemption_item_record_detail route begin');
    

    const data = await getMemberExpiredRedemptionItemRecordDetail(c);
    console.log('get_member_expired_redemption_item_record_detail route done');
    return c.json(data);
  } catch (error: any) {
    console.log('get_member_expired_redemption_item_record_detail end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});


memberRedemptionItemRouter.get('/get_member_redemption_item_setting', async (c: Context) => {
  try {
    console.log('get_member_redemption_item_setting route begin');
    
    const data = await getMemberRedemptionItemSetting(c);
    console.log('get_member_redemption_item_setting route done');
    return c.json(data);
  } catch (error) {
    console.log('get_member_redemption_item_setting route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});



// GET /member/get_member_detail/:memberPhone - Retrieve member details by phone
memberRedemptionItemRouter.get('/get_member_redemption_item_setting_detail/:redemption_item_id',memberAuthMiddleware, async (c: Context) => {
  try {
    console.log('get_member_redemption_item_setting_detail route begin');
    

    const data = await getMemberRedemptionItemSettingDetail(c);
    console.log('get_member_redemption_item_setting_detail route done');
    return c.json(data);
  } catch (error: any) {
    console.log('get_member_redemption_item_setting_detail end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});



memberRedemptionItemRouter.post('/post_member_redemption_item_redeem',memberAuthMiddleware, async (c: Context) => {
    try {
      console.log('post_member_redemption_item_redeem route begin');
      const response = await postMemberRedemptionItemRedeem(c);
      console.log('post_member_redemption_item_redeem route done');

      return response; // Return the Response directly
    } catch (error) {
      console.log('post_member_redemption_item_redeem route end in error');
      throw error;
    }
  });

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