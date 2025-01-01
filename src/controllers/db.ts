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

async function getTenantClient(tenantIdentifier: string) {

  console.log('getTenantClient function begin');

  const client = await pool.connect(); // Connect to the database

  console.log('pool connected');

  try {
    // Fetch the tenant's schema name based on the app URL from the master schema

    console.log('query system_tenant_login begin');
    // const aaa = await client.query('SHOW search_path')

    await client.query(`SET search_path TO system_schema;`);


    const result = await client.query(
      "SELECT tenant_schema FROM system_tenant_login WHERE tenant_host = $1",
      [tenantIdentifier]
    );

    console.log('query system_tenant_login done', result.rows);

    if (result.rows.length === 0) {
      throw new Error(`No schema found for app URL: ${tenantIdentifier}`);
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
    client.release();
    // client.release(); // Ensure connection is released on error
    throw error;
  }
}


async function getTenantHostAdmin(admin_host: string) {

  console.log('getTenantHostAdmin function begin');
  console.log('admin_host is: ', admin_host);

  const client = await pool.connect(); // Connect to the database

  try {
    // Fetch the tenant's schema name based on the app URL from the master schema

    console.log('getTenantHostAdmin function begin');
    // const aaa = await client.query('SHOW search_path')
    await client.query(`SET search_path TO system_schema;`);

    const result = await client.query(
      "SELECT tenant_host, admin_secret, app_domain FROM system_tenant_login WHERE admin_host = $1",
      [admin_host]
    );

    console.log('result', result.rows);

    const tenant_host = result.rows[0].tenant_host;
    const admin_secret = result.rows[0].admin_secret;
    const app_domain = result.rows[0].app_domain;

    console.log('query getTenantHostAdmin done, tenantIdentifier: ', tenant_host);
    console.log('query getTenantHostAdmin done, admin_secret: ', admin_secret);
    console.log('query getTenantHostAdmin done, app_domain: ', app_domain);

    const admin_secret_domain = result.rows[0]
    console.log('admin_secret_domain', admin_secret_domain);

    console.log('getTenantHostAdmin function done');
    // return admin_secret.rows[0].admin_secret;
    return admin_secret_domain;

  } catch (error) {
    console.error("Error fetching tenant schema or setting search_path:", error);
    throw error;
  } finally {
    client.release();
  }
};




async function getTenantHostCustomer(tenant_host: string) {

  console.log('getTenantHostCustomer function begin');

  const client = await pool.connect(); // Connect to the database

  try {
    // Fetch the tenant's schema name based on the app URL from the master schema
    // const aaa = await client.query('SHOW search_path')
    await client.query(`SET search_path TO system_schema;`);

    const result = await client.query(
      "SELECT customer_secret, app_domain FROM system_tenant_login WHERE tenant_host = $1",
      [tenant_host]
    );

    console.log('result', result.rows);

    const customer_secret = result.rows[0].customer_secret;
    const app_domain = result.rows[0].app_domain;

    console.log('query getTenantHostCustomer done, tenantIdentifier: ', tenant_host);
    console.log('query getTenantHostCustomer done, customer_secret: ', customer_secret);
    console.log('query getTenantHostCustomer done, app_domain: ', app_domain);

    const customer_secret_domain = result.rows[0]
    console.log('customer_secret_domain', customer_secret_domain);

    console.log('getTenantHostCustomer function done');
    // return customer_secret.rows[0].customer_secret;
    return customer_secret_domain;

  } catch (error) {
    console.error("Error fetching tenant schema or setting search_path:", error);
    throw error;
  } finally {
    client.release();
  }
};




export { pool, getTenantClient, getTenantHostAdmin, getTenantHostCustomer};