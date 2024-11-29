// src/controllers/tenant/post_tenant_create_new_schema.ts

import { pool } from "../db";
import type { Context } from "hono";

async function postTenantCreateNewSchema(c: Context): Promise<Response> {
  try {
    // Parse request body to get the schema name
    const { schema_name } = await c.req.json();

    // if (!schema_name) {
    //   return c.json({ message: "Schema name is required" }, 400);
    // }

    const new_name = "abc_test"
    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Create the new schema
      const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS ${schema_name}`;
      await client.query(createSchemaQuery);

      // Commit the transaction
      await client.query("COMMIT");

      return c.json({ message: `Schema ${schema_name} created successfully` }, 201);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error creating schema:", error);
      throw new Error("Schema creation failed");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error:", error);
    return c.json({ message: "Schema creation failed" }, 500);
  }
}

export default postTenantCreateNewSchema;