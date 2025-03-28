// // src/middleware/adminAuthMiddleware.ts

// import type { Context, Next } from 'hono';
// import jwt from 'jsonwebtoken';
// import { validator } from 'hono/validator'
// import { getCookie, setCookie } from 'hono/cookie'
// import { pool } from '../controllers/db';

// const MEMBI_ADMIN_SECRET = process.env.MEMBI_ADMIN_SECRET || 'admin';



// export const adminAuthMiddleware = async (c: Context, next: Next) => {

//   // const membi_admin_token = c.req.cookie('membi_admin_token');

//   const host = c.req.header('origin'); // Get the host from the request headers
//   // console.log('host', host);

//   const tenantIdentifier = extractTenantFromHost(host!);

//   if (!tenantIdentifier) {
//     return c.json({ error: 'Tenant identifier missing' }, 400); // Bad Request if no tenant is found
//   }

//   console.log('Tenant Identifier:', tenantIdentifier);

//   c.set('tenant', tenantIdentifier);

//   const admin_secret = getTenantHost(tenantIdentifier);

//   const membi_admin_token = getCookie(c, 'membi_admin_token');

//   console.log('membi_admin_token', membi_admin_token);

//   if (!membi_admin_token) {
//     return c.json({ error: 'Unauthorized' }, 401);
//   }

//   // console.log('membi_admin_token', membi_admin_token);
//   try {
//     const decoded = jwt.verify(membi_admin_token, MEMBI_ADMIN_SECRET);
//     c.set('user', decoded);

//     console.log('decoded', decoded);
//     await next();
//   } catch (err) {
//     return c.json({ error: 'Invalid token' }, 401);
//   }
// };


// export const adminLoginMiddleware = async (c: Context, next: Next) => {

//   // const membi_admin_token = c.req.cookie('membi_admin_token');
//   try {
//     const host = c.req.header('origin'); // Get the host from the request headers
//     // console.log('host', host);

//     const tenantIdentifier = extractTenantFromHost(host!);

//     if (!tenantIdentifier) {
//       return c.json({ error: 'Tenant identifier missing' }, 400); // Bad Request if no tenant is found
//     }

//     console.log('Tenant Identifier:', tenantIdentifier);

//     c.set('tenant', tenantIdentifier);

//     await next();
//   } catch (err) {
//     return c.json({ error: 'invalid tenant identifier' }, 401);
//   }
// };


// function extractTenantFromHost(host: string | null): string | null {
//   if (!host) {
//     return null;
//   }
//   console.log('host', host);

//   // Split the host by dots to isolate the subdomain
//   const parts = host.split('.');
//   // if (parts.length < 1) {
//   //   return null; // Return null if there is no subdomain
//   // }
//   console.log('parts', parts);

//   // Return the first part of the hostname (the subdomain)
//   return parts[0];
// }


// async function getTenantHost(tenantIdentifier: string) {

//   const client = await pool.connect(); // Connect to the database

//   try {
//     // Fetch the tenant's schema name based on the app URL from the master schema

//     console.log('getTenantHost function begin');
//     // const aaa = await client.query('SHOW search_path')
//     await client.query(`SET search_path TO system_schema;`);

//     const admin_secret = await client.query(
//       "SELECT admin_secret FROM system_tenant_login WHERE tenant_host = $1",
//       [tenantIdentifier]
//     );

//   } catch (error) {
//     console.error("Error fetching tenant schema or setting search_path:", error);
//     throw error;
//   } finally {
//     client.release();
//   }
// };