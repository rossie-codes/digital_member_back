// src/controllers/tenant_controllers/post_tenant_create_new_service.ts

import { pool } from "../db";
import type { Context } from "hono";
import getTenantLoginAvailability from "./get_tenant_login_availability";
import postTenantCreateNewTenantLoginRecord from "./post_tenant_create_new_tenant_login_record";

// async function cloneTenantSchema(sourceSchema, targetSchema) {
async function postTenantCreateNewService1(c: Context): Promise<Response> {

  console.log("postTenantCreateNewService function begin");
  const newTenatRecord = await postTenantCreateNewTenantLoginRecord(c);
  
  const availability = await getTenantLoginAvailability(c);
  

  console.log("availability", availability); 

  try {

    return c.json({ message: 'postTenantCreateNewService route done' });
  } catch (err) {
    console.error('Error postTenantCreateNewService:', err);
    throw err;
  } finally {
    // client.release();
  }
}

export default postTenantCreateNewService1