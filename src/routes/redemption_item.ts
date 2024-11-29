// src/routes/redemption_item.ts

import { Hono } from 'hono';
import { type Context } from 'hono';
import { authMiddleware } from '../middleware/authMiddleware';

import getRedemptionItemList from '../controllers/admin_controllers/redemption_item_setting/get_redemption_item_list';
import getRedemptionItemDetail from '../controllers/admin_controllers/redemption_item_setting/get_redemption_item_detail';
import getDeletedRedemptionItemList from '../controllers/admin_controllers/redemption_item_setting/get_deleted_redemption_item_list';

import postRedemptionItemSetting from '../controllers/admin_controllers/redemption_item_setting/post_redemption_item_setting';

import putRedemptionItemIsActive from '../controllers/admin_controllers/redemption_item_setting/put_redemption_item_is_active';
import putRedemptionItemDetail from '../controllers/admin_controllers/redemption_item_setting/put_redemption_item_detail';

import deleteRedemptionItem from '../controllers/admin_controllers/redemption_item_setting/delete_redemption_item';
import restoreRedemptionItem from '../controllers/admin_controllers/redemption_item_setting/restore_redemption_item';


// Import other controllers as needed

interface ErrorWithMessage {
  message: string;
}

const redemptionItemRouter = new Hono();

// redemptionItemRouter.use('*', authMiddleware); // Protect all member routes

// GET /member - Retrieve all members
redemptionItemRouter.get('/get_redemption_list', async (c: Context) => {
  try {
    console.log('get_redemption_list route begin');
    const data = await getRedemptionItemList(c)
    console.log('get_redemption_list route end');
    return c.json(data);
  } catch (error: any) {
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

redemptionItemRouter.post('/post_phone', async (c: Context) => {
  try {
    console.log('get_redemption_list route begin');
    const data = c.json(c.req.param)
    console.log('get_redemption_list route end');
    return c.json(data);
  } catch (error: any) {
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

redemptionItemRouter.get('/get_redemption_item_detail/:redemption_item_id', async (c: Context) => {
  try {
    console.log('get_redemption_detail route begin');

    const redemption_item_id = c.req.param('redemption_item_id');

    console.log('redemption_item_id is: ', redemption_item_id);

    const data = await getRedemptionItemDetail(redemption_item_id);
    console.log('get_redemption_detail route done');
    //   return data;
    return c.json(data);
  } catch (error: any) {
    console.log('get_redemption_detail end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});


redemptionItemRouter.post('/post_redemption_item', async (c: Context) => {
  try {
    console.log('post_redemption_item route begin');
    const data = await postRedemptionItemSetting(c)
    console.log('post_redemption_item route end');
    // console.log(data)
    return c.json(data);
  } catch (error: any) {
    // Let Hono’s `onError` handle the error
    throw error;
  }
});


redemptionItemRouter.put('/put_redemption_item_is_active/:redemption_item_id', async (c: Context) => {
  try {
    console.log('put_redemption_item_is_active route begin');

    const data = await putRedemptionItemIsActive(c);

    console.log('put_redemption_item_is_active route done');
    //   return data;
    return c.json(data);
  } catch (error: any) {
    console.log('put_redemption_item_is_active end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});

redemptionItemRouter.put('/put_redemption_item_detail/:redemption_item_id', async (c: Context) => {
  try {
    console.log('put_redemption_item_detail route begin');

    const data = await putRedemptionItemDetail(c);

    console.log('put_redemption_item_detail route done');
    //   return data;
    return c.json(data);
  } catch (error: any) {
    console.log('put_redemption_item_detail end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});


redemptionItemRouter.put('/delete_redemption_item/:redemption_item_id', async (c: Context) => {
  try {
    console.log('delete_redemption_item route begin');

    const data = await deleteRedemptionItem(c);

    console.log('delete_redemption_item route done');
    //   return data;
    return c.json(data);
  } catch (error: any) {
    console.log('delete_redemption_item end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});

redemptionItemRouter.put('/restore_redemption_item/:redemption_item_id', async (c: Context) => {
  try {
    console.log('restore_redemption_item route begin');

    const data = await restoreRedemptionItem(c);

    console.log('restore_redemption_item route done');
    //   return data;
    return c.json(data);
  } catch (error: any) {
    console.log('restore_redemption_item end in error');
    if (error.message === 'Member not found') {
      return c.json({ message: 'Member not found' }, 404);
    }
    throw error;
  }
});


redemptionItemRouter.get('/get_deleted_redemption_item_list', async (c:Context) => {
  try {
    console.log('get_delete_redemption_item_list route begin');
    const data = await getDeletedRedemptionItemList(c)
    console.log('get_delete_redemption_item_list route end');
    return c.json(data);
  } catch (error) {
    // Let Hono’s `onError` handle the error
    throw error;
  }
});




export default redemptionItemRouter;