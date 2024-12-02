// src/routes/member.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
import { authMiddleware } from '../../middleware/authMiddleware';

import getBroadcastList from '../../controllers/admin_controllers/broadcast_setting/get_broadcast_list';
import getBroadcastHistoryList from '../../controllers/admin_controllers/broadcast_setting/get_broadcast_history_list'
import getBroadcastMemberList from '../../controllers/admin_controllers/broadcast_setting/get_broadcast_member_list';
import getWatiTemplateDetail from '../../controllers/admin_controllers/broadcast_setting/get_wati_template_detail';

import getBroadcastDetail from '../../controllers/admin_controllers/broadcast_setting/get_broadcast_detail';

import postNewBroadcast from '../../controllers/admin_controllers/broadcast_setting/post_new_broadcast';
// import getMemberDetail from '..//admin_controllerscontrollers/member/get_member_detail';

import putEditBroadcastDetail from '../../controllers/admin_controllers/broadcast_setting/put_edit_broadcast_detail';

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

broadcastSettingRouter.get('/get_broadcast_history_list', async (c: Context) => {
  try {
    console.log('get_broadcast_history_list route begin');
    const data = await getBroadcastHistoryList(c);
    console.log('get_broadcast_history_list route done');
    return c.json(data);
  } catch (error) {
    console.log('get_broadcast_history_list route end in error');
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

broadcastSettingRouter.get('/get_broadcast_detail/:broadcast_id', async (c: Context) => {
  try {
    console.log('get_broadcast_detail route begin');
    const data = await getBroadcastDetail(c);
    console.log('get_broadcast_detail route done');
    return c.json(data);
  } catch (error) {
    console.log('get_broadcast_detail route end in error');
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

broadcastSettingRouter.get('/get_wati_template_detail/:wati_template_name', async (c: Context) => {
  try {
    console.log('get_wati_template_detail route begin');
    const data = await getWatiTemplateDetail(c);
    console.log('get_wati_template_detail route done');
    return c.json(data);
  } catch (error) {
    console.log('get_wati_template_detail route end in error');
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


  broadcastSettingRouter.put('/put_edit_broadcast_detail/:broadcast_id', async (c: Context) => {
    try {
      console.log('put_edit_broadcast route begin');
      const response = await putEditBroadcastDetail(c);
      console.log('put_edit_broadcast route done');

      return response; // Return the Response directly
    } catch (error) {
      console.log('put_edit_broadcast route end in error');
      throw error;
    }
  });


export default broadcastSettingRouter;