// src/routes/tenant_routes/tenant.ts

import { Hono } from "hono";
import { type Context } from "hono";
// import { adminAuthMiddleware } from '../../middleware/adminAuthMiddleware';

import cloneTenantSchema from "../../controllers/tenant_controllers/post_tenant_clone_new_schema";
import theWholeFlowAdmin from "../../controllers/tenant_controllers/post_the_whole_flow_admin";
import theWholeFlowCustomer from "../../controllers/tenant_controllers/post_the_whole_flow_customer";
import postTenantCreateNewTenantLoginRecord from "../../controllers/tenant_controllers/post_tenant_create_new_tenant_login_record";

const tenantRouter = new Hono();

// dashboardRouter.use("*", adminAuthMiddleware); // Protect all member routes

tenantRouter.post("/post_new_tenant", async (c: Context) => {
  try {
    console.log("post_new_tenant route begin");

    // const data = await cloneTenantSchema(c);
    // const data = await postTenantCreateNewTenantLoginRecord(c);

    const data = await theWholeFlowCustomer(c);
    // const data = await theWholeFlowAdmin(c);

    console.log("data", data);
    console.log("post_new_tenant route done");

    // return c.json(data);
    const info = await c.req.formData();

    console.log("info", info);

    // const { company_name } = info;

    // console.log('company_name', company_name);
    return c.json({ message: "post_new_tenant route done" });
  } catch (error) {
    console.log("post_new_tenant route end in error");
    // Let Hono’s `onError` handle the error
    throw error;
  }
});

export default tenantRouter;
