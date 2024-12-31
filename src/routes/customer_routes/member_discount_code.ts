// src/routes/member.ts

import { Hono } from 'hono';
import { type Context } from 'hono';

import {memberAuthMiddleware} from '../../middleware/memberAuthMiddleware';

import getMemberDiscountCodeList from '../../controllers/member_controllers/member_discount_code/get_member_discount_code_list'; 
import getMemberDiscountCodeDetail from '../../controllers/member_controllers/member_discount_code/get_member_discount_code_detail';





import { HTTPException } from 'hono/http-exception'

// Import other controllers as needed

const memberDiscountCodeRouter = new Hono();

memberDiscountCodeRouter.use('*', memberAuthMiddleware); // Protect all member routes


// GET /member - Retrieve all members
memberDiscountCodeRouter.get('/get_member_discount_code_list', async (c: Context) => {
  try {
    console.log('get_member_discount_code route begin');
    
    const data = await getMemberDiscountCodeList(c);
    console.log('get_member_discount_code route done');
    return c.json(data);
  } catch (error) {
    console.log('get_member_discount_code route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

// GET /member/get_member_detail/:memberPhone - Retrieve member details by phone
memberDiscountCodeRouter.get('/get_member_discount_code_detail/:discount_code_id', async (c: Context) => {
  try {
    console.log('get_member_discount_code_detail route begin');
    

    const data = await getMemberDiscountCodeDetail(c);
    console.log('get_member_discount_code_detail route done');
    return c.json(data);
  } catch (error: any) {
    console.log('get_member_discount_code_detail end in error');
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



export default memberDiscountCodeRouter;