// src/controllers/tenant_controllers/post_tenant_clone_new_schema.ts

import { pool } from "../db";
import type { Context } from "hono";

const sourceSchema = 'membi_template_schema'
const targetSchema = 'mm9_client'

// async function cloneTenantSchema(sourceSchema, targetSchema) {
async function cloneTenantSchema() {

  console.log("cloneTenantSchema function begin");

  const sourceSchema = 'membi_template_schema'
  const targetSchema = 'mm9_client'

  try {
    console.log("cloneTenantSchema function start connection");
    const client = await pool.connect();

    console.log("cloneTenantSchema function connection success");
    // Call the clone_schema function
    console.log("cloneTenantSchema function start performing query");
    await client.query('SELECT system_schema.clone_schema($1, $2);', [sourceSchema, targetSchema]);

    console.log("cloneTenantSchema function query success");

    console.log(`Schema cloned from ${sourceSchema} to ${targetSchema}`);
  } catch (err) {
    console.error('Error cloning schema:', err);
    throw err;
  }
}

export default cloneTenantSchema