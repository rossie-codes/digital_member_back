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
    const result = await client.query('SELECT system_schema.clone_schema($1, $2);', [sourceSchema, targetSchema]);

    console.log("cloneTenantSchema function query success");

    console.log(`Schema cloned from ${sourceSchema} to ${targetSchema}`);

    console.log("result: ", result); 
    console.log("result.rows: ", result.rows); 
    console.log("result.rows[0]: ", result.rows[0]);
    console.log("result.rows[0].clone_schema: ", result.rows[0].clone_schema); 

    return result.rows[0].clone_schema;
  } catch (err) {
    console.error('Error cloning schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

export default cloneTenantSchema