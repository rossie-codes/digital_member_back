// src/middleware/adminAuthMiddleware.ts

import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { validator } from 'hono/validator'
import { getCookie, setCookie } from 'hono/cookie'
import { getTenantHostAdmin } from '../controllers/db';

const MEMBI_ADMIN_SECRET = process.env.MEMBI_ADMIN_SECRET || 'admin';

export const adminAuthMiddleware = async (c: Context, next: Next) => {

  // const membi_admin_token = c.req.cookie('membi_admin_token');

  const user_sub_domain = c.req.header('origin'); // Get the host from the request headers
  const admin_host = extractTenantFromHost(user_sub_domain!);
  if (!admin_host) {
    return c.json({ error: 'Tenant identifier missing' }, 400); // Bad Request if no tenant is found
  }
  console.log('Tenant Identifier:', admin_host);


  const admin_secret_domain = await getTenantHostAdmin(admin_host);
  console.log('admin_secret_domain: ', admin_secret_domain)
  const admin_secret = admin_secret_domain.admin_secret;
  const app_domain = admin_secret_domain.app_domain;
  const tenant_host = admin_secret_domain.tenant_host;

  c.set('app_domain', app_domain);
  c.set('tenant_host', tenant_host);

  const membi_admin_token = getCookie(c, `${tenant_host}_admin_token`);
  console.log('membi_admin_token', membi_admin_token);


  if (!membi_admin_token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // console.log('membi_admin_token', membi_admin_token);
  try {
    // const decoded = jwt.verify(membi_admin_token, MEMBI_ADMIN_SECRET);
    const decoded = jwt.verify(membi_admin_token, admin_secret);
    c.set('user', decoded);

    console.log('decoded', decoded);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};


export const adminLoginMiddleware = async (c: Context, next: Next) => {

  // const membi_admin_token = c.req.cookie('membi_admin_token');
  try {
    const user_sub_domain = c.req.header('origin'); // Get the host from the request headers
    // console.log('host', host);

    console.log('the sub-domin of the user is: ', user_sub_domain);

    const tenant_host = extractTenantFromHost(user_sub_domain!);

    if (!tenant_host) {
      return c.json({ error: 'Tenant identifier missing' }, 400); // Bad Request if no tenant is found
    }

    console.log('Tenant Identifier:', tenant_host);

    c.set('tenant_host', tenant_host);

    const admin_secret_domain = await getTenantHostAdmin(tenant_host);
    console.log('admin_secret_domain: ', admin_secret_domain)
    const admin_secret = admin_secret_domain.admin_secret;
    const app_domain = admin_secret_domain.app_domain;

    c.set('app_domain', app_domain);



    await next();
  } catch (err) {
    return c.json({ error: 'invalid tenant identifier' }, 401);
  }
};


function extractTenantFromHost(host: string | null): string | null {
  if (!host) {
    return null;
  }
  console.log('host', host);

  try {

    const url = new URL(host); // Use URL constructor to parse
    const hostname = url.hostname; // Get the hostname (e.g., "membi-admin.up.railway.app")
    const parts = hostname.split('.');

    console.log('parts', parts);
    // Return the first part of the hostname (the subdomain)
    return parts[0];
  }
  catch (err) {
    return null;
  }
}


