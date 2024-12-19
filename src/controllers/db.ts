// src/controllers/db.ts

import pg from "pg";

const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT || "5432", 10),
  options: '-c search_path=system_schema'
  // SSL configuration (if needed)
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// /**
//  * Function to get a tenant-specific client by dynamically setting the search_path.
//  * @param appUrl The tenant's frontend app URL.
//  * @returns A client connected to the tenant's schema.
//  */

async function getTenantClient(appUrl: string) {

  console.log('getTenantClient function begin');

  const client = await pool.connect(); // Connect to the database

  console.log('pool connected');

  try {
    // Fetch the tenant's schema name based on the app URL from the master schema

    console.log('query system_tenant_login begin');
    
    const result = await client.query(
      "SELECT tenant_schema FROM system_tenant_login WHERE tenant_host = $1",
      [appUrl]
    );

    console.log('query system_tenant_login done', result.rows);

    if (result.rows.length === 0) {
      throw new Error(`No schema found for app URL: ${appUrl}`);
    }

    const tenantSchema = result.rows[0].tenant_schema;

    console.log('tenantSchema', tenantSchema);

    // Set the search_path for the client's connection
    await client.query(`SET search_path TO ${tenantSchema};`);

    console.log('search_path set', tenantSchema);

    console.log('getTenantClient function done');

    // Return the client with the tenant's schema set
    return client;

  } catch (error) {
    console.error("Error fetching tenant schema or setting search_path:", error);
    client.release(); // Ensure connection is released on error
    throw error;
  }
}


async function queryTenantSchema(tenant: string, query: string, values?: any[]) {

  console.log('queryTenantSchema function begin');

  const client = await getTenantClient(tenant);

  console.log('queryTenantSchema function after getTenantClient done');
  try {
    const result = await client.query(query, values);
    return result;
  } catch (error) {
    console.error("Error querying tenant schema:", error);
    throw error;
  } finally {
    client.release(); // Always release the connection back to the pool
  }
}

export { queryTenantSchema, pool };


// const result = await queryTenantSchema.query(tenant, query, values);