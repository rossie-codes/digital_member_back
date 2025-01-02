// src/controllers/tenant_controllers/post_tenant_clone_new_schema.ts

import { pool } from "../db";
import type { Context } from "hono";


// async function cloneTenantSchema(sourceSchema, targetSchema) {
async function cloneTenantSchema(targetSchema: string): Promise<Response> {

  console.log("cloneTenantSchema function begin");

  const sourceSchema = 'membi_template_schema'
  // const targetSchema2 = 'membi_0002_xuMJgy'

  console.log("cloneTenantSchema function start connection");
  const client = await pool.connect();

  try {
    console.log("cloneTenantSchema function connection success");
    // Call the clone_schema function
    console.log("cloneTenantSchema function start performing query");
    const cloneResult = await client.query('SELECT system_schema.clone_schema($1, $2);', [sourceSchema, targetSchema]);

    console.log("Schema cloned successfully:", cloneResult.rows[0].clone_schema);
    console.log("cloneTenantSchema function query success");

    try {
      // 1) Insert into admin_setting
      const insertAdminSettingQuery = `
        INSERT INTO ${targetSchema}.admin_setting(
          admin_setting_id,
          membership_extend_method,
          membership_end_result,
          membership_period
        )
        VALUES (1, 1, 1, 1)
      `;
      await client.query(insertAdminSettingQuery);
      console.log("Inserted initial data into admin_setting");

      // 2) Insert into membership_tier (multiple rows at once)
      const insertMembershipTierQuery = `
        INSERT INTO ${targetSchema}.membership_tier(
          membership_tier_id,
          membership_tier_name,
          membership_tier_sequence,
          require_point,
          extend_membership_point,
          point_multiplier,
          membership_period,
          original_point,
          multiplied_point
        )
        VALUES
          (1, '初階會員', 1, 0, 0, 1000, 1, 1, 1),
          (2, 'Level 2', 2, 1, 1, 1000, 2, 100, 100),
          (3, 'Level 3', 3, 3, 3, 1000, 3, 110, 110),
          (4, 'Level 4', 4, 4, 4, 1000, 4, 120, 120)
      `;
      await client.query(insertMembershipTierQuery);
      console.log("Inserted initial data into membership_tier");
    } catch (error) {
      console.error("Error adding first data:", error);
      throw error;
    }

    return cloneResult.rows[0].clone_schema;
  } catch (err) {
    console.error('Error cloning schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

export default cloneTenantSchema