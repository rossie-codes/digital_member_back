// src/routes/member.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
import { authMiddleware } from '../middleware/authMiddleware';

import getBroadcastList from '../controllers/broadcast_setting/get_broadcast_list';
import getBroadcastMemberList from '../controllers/broadcast_setting/get_broadcast_member_list';
import postNewBroadcast from '../controllers/broadcast_setting/post_new_broadcast';
// import getMemberDetail from '../controllers/member/get_member_detail';


import { HTTPException } from 'hono/http-exception'

// Import other controllers as needed

const broadcastSettingRouter = new Hono();

// memberRouter.use('*', authMiddleware); // Protect all member routes


// GET /member - Retrieve all members
broadcastSettingRouter.get('/get_broadcast_list', async (c: Context) => {
  try {
    console.log('get_broadcast_list route begin');
    const data = await getBroadcastList(c);
    console.log('get_broadcast_list route done');
    return c.json(data);
  } catch (error) {
    console.log('get_broadcast_list route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

broadcastSettingRouter.get('/get_broadcast_member_list', async (c: Context) => {
  try {
    console.log('get_broadcast_member_list route begin');
    const data = await getBroadcastMemberList(c);
    console.log('get_broadcast_member_list route done');
    return c.json(data);
  } catch (error) {
    console.log('get_broadcast_member_list route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});


// // GET /member/get_member_detail/:memberPhone - Retrieve member details by phone
// broadcastSettingRouter.get('/get_member_detail/:memberPhone', async (c: Context) => {
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

broadcastSettingRouter.post('/post_new_broadcast', async (c: Context) => {
    try {
      console.log('post_new_broadcast route begin');
      const response = await postNewBroadcast(c);
      console.log('post_new_broadcast route done');

      return response; // Return the Response directly
    } catch (error) {
      console.log('post_new_broadcast route end in error');
      throw error;
    }
  });





export default broadcastSettingRouter;