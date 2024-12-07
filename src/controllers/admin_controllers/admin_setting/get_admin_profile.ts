// src/controllers/admin_controllers/admin/get_admin_profile.ts

import { pool } from "../../db";
import type { Context } from "hono";
import getWatiDetails from "../../../wati/wati_client";
import postTenantCreateNewSchema from "../../tenant_controllers/post_tenant_create_new_schema";

// Define the response interface
interface ProfileDetail {
  admin_name: string;
}

async function getAdminProfileDetail(c: Context): Promise<ProfileDetail> {
  console.log("getAdminProfileDetail function begin");

  // const watiDetails = await getWatiDetails();

  // console.log("watidetails", watiDetails);

  const newSchema = await postTenantCreateNewSchema(c);

  console.log("newSchema", newSchema);

  const user = c.get("user"); // Assuming admin user is set in context
  const admin_id = user.adminId;

  try {
    const query = `
      SELECT admin_name
      FROM admin_login
      WHERE admin_id = $1
    `;
    const values = [admin_id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Admin not found");
    }

    const row = result.rows[0];

    const adminProfileDetail: ProfileDetail = {
      admin_name: row.admin_name,
    };

    console.log("getAdminProfileDetail function end");
    return adminProfileDetail;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getAdminProfileDetail;
