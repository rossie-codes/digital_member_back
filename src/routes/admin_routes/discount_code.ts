// src/routes/member.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
import { adminAuthMiddleware } from '../../middleware/adminAuthMiddleware';

import getDiscountCodeList from '../../controllers/admin_controllers/discount_code/get_discount_code_list';
import getDiscountCodeDetail from '../../controllers/admin_controllers/discount_code/get_discount_code_detail';
import getDeletedDiscountCodeList from '../../controllers/admin_controllers/discount_code/get_deleted_discount_code_list';

import postNewDiscountCode from '../../controllers/admin_controllers/discount_code/post_new_discount_code';

import putDiscountCodeDetail from '../../controllers/admin_controllers/discount_code/put_discount_code_detail';
import putDiscountCodeIsActive from '../../controllers/admin_controllers/discount_code/put_discount_code_is_active';



import deleteDiscountCode from '../../controllers/admin_controllers/discount_code/delete_discount_code';
import restoreDiscountCode from '../../controllers/admin_controllers/discount_code/restore_discount_code';

// import postNewMember from '../controllers/member/post_new_member';
// import getMemberDetail from '../controllers/member/get_member_detail';

import { HTTPException } from 'hono/http-exception'

// Import other controllers as needed

const discountCodeRouter = new Hono();

discountCodeRouter.use('*', adminAuthMiddleware); // Protect all member routes

discountCodeRouter.get('/get_discount_code_list', async (c: Context) => {
  try {
    const data = await getDiscountCodeList(c);
    return c.json(data);
  } catch (error) {
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

discountCodeRouter.get('/get_discount_code_detail/:discount_code_id', async (c: Context) => {
  try {
    console.log('get_discount_code_detail route begin');


    const data = await getDiscountCodeDetail(c);
    console.log('get_discount_code_detail route done');
    //   return data;
    return c.json(data);
  } catch (error: any) {
    console.log('get_discount_code_detail end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});

discountCodeRouter.get('/get_deleted_discount_code_list', async (c: Context) => {
  try {
    console.log('get_deleted_discount_code_list route begin');
    const data = await getDeletedDiscountCodeList(c)
    console.log('get_deleted_discount_code_list route end');
    return c.json(data);
  } catch (error) {
    // Let Hono’s `onError` handle the error
    throw error;
  }
});



// // GET /member/get_member_detail/:memberPhone - Retrieve member details by phone
// discountCodeRouter.get('/get_member_detail/:memberPhone', async (c: Context) => {
//   try {
//     console.log('get_member_detail route begin');

//     const memberPhone = c.req.param('memberPhone');

//     console.log('memberPhone is: ', memberPhone);

//     const data = await AAA(memberPhone);
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

discountCodeRouter.post('/post_new_discount_code', async (c: Context) => {
  try {
    console.log('post_new_discount_code route begin');
    const response = await postNewDiscountCode(c);
    console.log('post_new_discount_code route done');

    return response; // Return the Response directly
  } catch (error) {
    console.log('post_new_discount_code route end in error');
    throw error;
  }
});

discountCodeRouter.put('/put_discount_code_detail/:discount_code_id', async (c: Context) => {
  try {
    console.log('put_discount_code_detail route begin');

    const data = await putDiscountCodeDetail(c);

    console.log('put_discount_code_detail route done');
    //   return data;
    return c.json(data);
  } catch (error: any) {
    console.log('put_discount_code_detail end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});

discountCodeRouter.put('/put_discount_code_is_active/:discount_code_id', async (c: Context) => {
  try {
    console.log('put_discount_code_is_active route begin');

    const data = await putDiscountCodeIsActive(c);

    console.log('put_discount_code_is_active route done');
    //   return data;
    return c.json(data);
  } catch (error: any) {
    console.log('put_discount_code_is_active end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});



discountCodeRouter.put('/delete_discount_code/:discount_code_id', async (c: Context) => {
  try {
    console.log('delete_discount_code route begin');

    const data = await deleteDiscountCode(c);

    console.log('delete_discount_code route done');
    //   return data;
    return c.json(data);
  } catch (error: any) {
    console.log('delete_discount_code end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});


discountCodeRouter.put('/restore_discount_code/:discount_code_id', async (c: Context) => {
  try {
    console.log('restore_discount_code route begin');

    const data = await restoreDiscountCode(c);

    console.log('restore_discount_code route done');
    //   return data;
    return c.json(data);
  } catch (error: any) {
    console.log('restore_discount_code end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});





export default discountCodeRouter;