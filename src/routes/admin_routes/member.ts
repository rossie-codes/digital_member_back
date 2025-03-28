// src/routes/member.ts

import { Hono } from "hono";
import { type Context } from "hono";
import { adminAuthMiddleware } from "../../middleware/adminAuthMiddleware";

import getMemberList from "../../controllers/admin_controllers/member/get_member_list";
import getBirthdayMemberIds from "../../controllers/admin_controllers/member/get_birthday_member_ids";
import postNewMember from "../../controllers/admin_controllers/member/post_new_member";
import getMemberDetail from "../../controllers/admin_controllers/member/get_member_detail";
import putSuspendMembership from "../../controllers/admin_controllers/member/put_suspend_membership";
import putReactivateMembership from "../../controllers/admin_controllers/member/put_reactivate_membership";
import putChangeMemberDetail from "../../controllers/admin_controllers/member/put_change_member_detail";

import { HTTPException } from "hono/http-exception";

const memberRouter = new Hono();

memberRouter.use("*", adminAuthMiddleware); // Protect all member routes

// GET /member - Retrieve all members
memberRouter.get("/get_member_list", async (c: Context) => {
  try {
    console.log("get_member_list route begin");
    const data = await getMemberList(c);
    console.log("get_member_list route done");
    return c.json(data);
  } catch (error) {
    console.log("get_member_list route end in error");
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

memberRouter.get("/get_birthday_member_ids", async (c: Context) => {
  try {
    console.log("get_birthday_member_ids route begin");
    const data = await getBirthdayMemberIds(c);
    console.log("get_birthday_member_ids route done");
    return c.json(data);
  } catch (error) {
    console.log("get_birthday_member_ids route end in error");
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

// GET /member/get_member_detail/:memberPhone - Retrieve member details by phone
memberRouter.get("/get_member_detail/:memberPhone", async (c: Context) => {
  try {
    console.log("get_member_detail route begin");

    const data = await getMemberDetail(c);

    console.log("get_member_detail route done");
    return c.json(data);
  } catch (error: any) {
    console.log("get_member_detail end in error");
    if (error.message === "Member not found") {
      return c.json({ message: "Member not found" }, 404);
    }
    throw error;
  }
});

memberRouter.post("/post_new_member", async (c: Context) => {
  try {
    console.log("post_new_member route begin");
    const response = await postNewMember(c);
    console.log("post_new_member route done");

    return response; // Return the Response directly
  } catch (error) {
    console.log("post_new_member route end in error");
    throw error;
  }
});

memberRouter.put("/put_suspend_membership/:memberPhone", async (c: Context) => {
  try {
    console.log("put_suspend_membership route begin");
    const response = await putSuspendMembership(c);
    console.log("put_suspend_membership route done");

    return response; // Return the Response directly
  } catch (error) {
    console.log("put_suspend_membership route end in error");
    throw error;
  }
});

memberRouter.put(
  "/put_reactivate_membership/:memberPhone",
  async (c: Context) => {
    try {
      console.log("put_reactivate_membership route begin");
      const response = await putReactivateMembership(c);
      console.log("put_reactivate_membership route done");

      return response; // Return the Response directly
    } catch (error) {
      console.log("put_suspend_membership route end in error");
      throw error;
    }
  }
);

memberRouter.put(
  "/put_change_member_detail/:memberPhone",
  async (c: Context) => {
    try {
      console.log("put_change_member_detail route begin");
      const response = await putChangeMemberDetail(c);
      console.log("put_change_member_detail route done");

      return response; // Return the Response directly
    } catch (error) {
      console.log("put_suspend_membership route end in error");
      throw error;
    }
  }
);

export default memberRouter;
