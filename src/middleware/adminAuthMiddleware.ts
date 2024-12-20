// src/middleware/adminAuthMiddleware.ts

import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { validator } from 'hono/validator'
import { getCookie, setCookie } from 'hono/cookie'
import { getTenantHost } from '../controllers/db';

const MEMBI_ADMIN_SECRET = process.env.MEMBI_ADMIN_SECRET || 'admin';



export const adminAuthMiddleware = async (c: Context, next: Next) => {

  // const membi_admin_token = c.req.cookie('membi_admin_token');

  const host = c.req.header('host'); // Get the host from the request headers
  const tenant = extractTenantFromHost(host!);
  if (!tenant) {
    return c.json({ error: 'Tenant identifier missing' }, 400); // Bad Request if no tenant is found
  }
  console.log('Tenant Identifier:', tenant);
  c.set('tenant', tenant);

  const admin_secret_domain = await getTenantHost(tenant);
  console.log('admin_secret_domain: ', admin_secret_domain)
  const admin_secret = admin_secret_domain.admin_secret;
  const app_domain = admin_secret_domain.app_domain;

  c.set('app_domain', app_domain);


  const membi_admin_token = getCookie(c, 'membi_admin_token');
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
    const host = c.req.header('host'); // Get the host from the request headers
    // console.log('host', host);

    console.log('hostaaaa', host);

    const tenant = extractTenantFromHost(host!);

    if (!tenant) {
      return c.json({ error: 'Tenant identifier missing' }, 400); // Bad Request if no tenant is found
    }

    console.log('Tenant Identifier:', tenant);

    c.set('tenant', tenant);

    const admin_secret_domain = await getTenantHost(tenant);
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

  // Split the host by dots to isolate the subdomain
  const parts = host.split('.');
  // if (parts.length < 1) {
  //   return null; // Return null if there is no subdomain
  // }
  console.log('parts', parts);

  // Return the first part of the hostname (the subdomain)
  return parts[0];
}


