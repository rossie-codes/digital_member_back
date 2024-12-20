// src/routes/member.ts

import { Hono } from "hono";
import { type Context } from "hono";
import { adminAuthMiddleware } from "../../middleware/adminAuthMiddleware";

import getAdminProfile from "../../controllers/admin_controllers/admin_setting/get_admin_profile";

import putAdminUpdateProfileDetail from "../../controllers/admin_controllers/admin_setting/put_admin_update_profile_detail";
import putAdminUpdateWatiDetail from "../../controllers/admin_controllers/admin_setting/put_admin_update_wati_detail";

const adminSettingRouter = new Hono();

adminSettingRouter.use("*", adminAuthMiddleware); // Protect all member routes

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


export default adminSettingRouter;
