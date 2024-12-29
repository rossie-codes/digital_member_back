// src/controllers/tenant/post_tenant_create_new_schema.ts

import { pool } from "../db";
import type { Context } from "hono";
import format from 'pg-format'; // You might need to install pg-format

async function postTenantCreateNewSchema(c: Context): Promise<Response> {
  console.log("postTenantCreateNewSchema function begin");
  try {
    const new_name = "abc_test"; // Hardcoded schema name
    
    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      console.log("start create schema");

      // Create the new schema using pg-format for proper escaping
      const createSchemaQuery = format('CREATE SCHEMA IF NOT EXISTS %I', new_name);
      await client.query(createSchemaQuery);

      console.log("done create schema");
      
      // Commit the transaction
      await client.query("COMMIT");

      return c.json({ 
        success: true,
        message: `Schema ${new_name} created successfully` 
      }, 201);

    } catch (error: any) {
      await client.query("ROLLBACK");
      console.error("Error creating schema:", error);
      return c.json({ 
        success: false,
        message: "Schema creation failed",
        error: error.message 
      }, 500);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error:", error);
    return c.json({ 
      success: false,
      message: "Schema creation failed",
      error: error.message 
    }, 500);
  }
}

export default postTenantCreateNewSchema;