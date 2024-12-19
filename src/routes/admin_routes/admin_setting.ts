// src/routes/member.ts

import { Hono } from "hono";
import { type Context } from "hono";
import { adminAuthMiddleware } from "../../middleware/adminAuthMiddleware";

import getAdminProfile from "../../controllers/admin_controllers/admin_setting/get_admin_profile";
// import getBirthdayMemberIds from '../../controllers/admin_controllers/member/get_birthday_member_ids';

import putAdminUpdateProfileDetail from "../../controllers/admin_controllers/admin_setting/put_admin_update_profile_detail";
import putAdminUpdateWatiDetail from "../../controllers/admin_controllers/admin_setting/put_admin_update_wati_detail";

import { HTTPException } from "hono/http-exception";
// Import other controllers as needed

const adminSettingRouter = new Hono();

adminSettingRouter.use("*", adminAuthMiddleware); // Protect all member routes

// GET /member - Retrieve all members
adminSettingRouter.get("/get_admin_profile", async (c: Context) => {
  try {
    console.log("get_admin_profile route begin");
    const response = await getAdminProfile(c);
    console.log("get_admin_profile route done");
    return c.json(response);
  } catch (error) {
    console.log("get_admin_profile route end in error");
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

adminSettingRouter.put(
  "/put_admin_update_profile_detail",
  async (c: Context) => {
    try {
      console.log("put_admin_update_profile_detail route begin");
      const response = await putAdminUpdateProfileDetail(c);
      console.log("put_admin_update_profile_detail route done");
      return response;
    } catch (error) {
      console.log("put_admin_update_profile_detail route end in error");
      // Let Hono’s `onError` handle the error
      throw error;
    }
  }
);

adminSettingRouter.put("/put_admin_update_wati_detail", async (c: Context) => {
  try {
    console.log("put_admin_update_wati_detail route begin");
    const response = await putAdminUpdateWatiDetail(c);
    console.log("put_admin_update_wati_detail route done");
    return response;
  } catch (error) {
    console.log("put_admin_update_wati_detail route end in error");
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

// adminSettingRouter.get('/get_birthday_member_ids', async (c: Context) => {
//   try {
//     console.log('get_birthday_member_ids route begin');
//     const data = await getBirthdayMemberIds(c);
//     console.log('get_birthday_member_ids route done');
//     return c.json(data);
//   } catch (error) {
//     console.log('get_birthday_member_ids route end in error');
//     // Let Hono’s `onError` handle the error
//     throw error;
//   }
// });

// // GET /member/get_member_detail/:memberPhone - Retrieve member details by phone
// adminSettingRouter.get('/get_member_detail/:memberPhone', async (c: Context) => {
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

// adminSettingRouter.post('/post_new_member', async (c: Context) => {
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

//   adminSettingRouter.put('/put_suspend_membership/:memberPhone', async (c: Context) => {
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

//   adminSettingRouter.put('/put_reactivate_membership/:memberPhone', async (c: Context) => {
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

//   adminSettingRouter.put('/put_change_member_detail/:memberPhone', async (c: Context) => {
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

export default adminSettingRouter;
