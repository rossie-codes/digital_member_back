// src/controllers/admin_controllers/auth/admin_logout.ts

import type { Context } from "hono";
import { serialize } from "cookie";
import { getTenantClient } from "../../db";

export async function logoutAdmin(c: Context) {
  console.log("Logging out admin...");

  const app_domain = c.get("app_domain");
  const tenant_host = c.get("tenant_host");
  // const tenantIdentifier = 'https://mm9_client'
  // const tenantIdentifier = 'https://membi-admin'

  console.log("tenant at login as tenant_host: ", tenant_host);
  console.log("tenant at login ad app_domain: ", app_domain);

  const pool = await getTenantClient(tenant_host);

  try {
    // Clear the membi_admin_token cookie
    // const cookie = serialize('membi_admin_token', '', {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   expires: new Date(0), // Set expiry date in the past
    //   path: '/',
    // });

    const cookie = serialize(`${tenant_host}_admin_token`, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Change from 'strict' to 'lax'
      maxAge: 1, // 1 secord
      path: "/",
      domain:
        process.env.NODE_ENV === "production" ? ".up.railway.app" : undefined,
    });

    c.header("Set-Cookie", cookie);

    console.log("Logged out successfully");

    return c.json({ message: "Logged out successfully" }, 200);
  } finally {
    pool.release();
  }
}
