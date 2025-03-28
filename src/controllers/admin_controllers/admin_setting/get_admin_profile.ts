// src/controllers/admin_controllers/admin/get_admin_profile.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import type { Context } from "hono";
import getWatiDetails from "../../../wati/wati_client";
import postTenantCreateNewSchema from "../../tenant_controllers/backup_post_tenant_create_new_schema";
import cloneTenantSchema from "../../tenant_controllers/post_tenant_clone_new_schema";


// Define the response interface
interface ProfileDetail {
  admin_name: string;
}

async function getAdminProfileDetail(c: Context): Promise<ProfileDetail> {
  console.log("getAdminProfileDetail function begin");

  // const watiDetails = await getWatiDetails();

  // console.log("watidetails", watiDetails);

  // console.log("cloneTenantSchema function begin");
  // const newSchema = await cloneTenantSchema();
  // console.log("cloneTenantSchema function done");

  // const newSchema = await postTenantCreateNewSchema(c);

  // console.log("newSchema", newSchema);

  const user = c.get("user"); // Assuming admin user is set in context
  const admin_id = user.adminId;




  // const tenant = 'https://mm9_client'
  // const tenant = 'https://membi-admin'

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    const query = `
      SELECT admin_name
      FROM admin_login
      WHERE admin_id = $1
    `;
    const values = [admin_id];


    // const result = await queryTenantSchema(tenant, query, values);
    const result = await pool.query(query, values);


    if (result.rows.length === 0) {
      throw new Error("Admin not found");
    }

    const row = result.rows[0];


    const adminProfileDetail: ProfileDetail = {
      admin_name: row.admin_name,
    };

    console.log("adminProfileDetail", adminProfileDetail)

    console.log("getAdminProfileDetail function done");
    
    return adminProfileDetail;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  } finally {
    pool.release();
  }
}

export default getAdminProfileDetail;
