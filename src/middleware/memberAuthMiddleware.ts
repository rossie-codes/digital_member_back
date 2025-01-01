// src/middleware/memberAuthMiddleware.ts

import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { validator } from 'hono/validator'
import { getCookie, setCookie } from 'hono/cookie'
import { getTenantHostCustomer } from '../controllers/db';

const MEMBI_CUSTOMER_SECRET = process.env.MEMBI_CUSTOMER_SECRET || 'customer';

export const memberAuthMiddleware = async (c: Context, next: Next) => {

  // const membi_m_token = c.req.cookie('membi_m_token');

  const user_sub_domain = c.req.header('origin'); // Get the host from the request headers
  const tenant_host = extractTenantFromHost(user_sub_domain!);
  if (!tenant_host) {
    return c.json({ error: 'Tenant identifier missing' }, 400); // Bad Request if no tenant is found
  }
  console.log('Tenant Identifier:', tenant_host);

  const customer_secret_domain = await getTenantHostCustomer(tenant_host);
  console.log('customer_secret_domain: ', customer_secret_domain)
  const customer_secret = customer_secret_domain.customer_secret;
  const app_domain = customer_secret_domain.app_domain;

  c.set('app_domain', app_domain);
  c.set('tenant_host', tenant_host);
  c.set('customer_secret', customer_secret);

  const membi_m_token = getCookie(c, `${tenant_host}_m_token`);
  console.log('membi_m_token', membi_m_token);

  if (!membi_m_token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // console.log('membi_m_token', membi_m_token);
  try {
    const decoded = jwt.verify(membi_m_token, customer_secret);
    c.set('user', decoded);

    console.log('decoded', decoded);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};



export const memberLoginMiddleware = async (c: Context, next: Next) => {

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

    const customer_secret_domain = await getTenantHostCustomer(tenant_host);
    console.log('customer_secret_domain: ', customer_secret_domain)
    const customer_secret = customer_secret_domain.customer_secret;
    const app_domain = customer_secret_domain.app_domain;

    c.set('app_domain', app_domain);
    c.set('tenant_host', tenant_host);
    c.set('customer_secret', customer_secret)

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


