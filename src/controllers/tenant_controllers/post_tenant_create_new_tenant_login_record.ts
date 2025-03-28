import { pool } from "../db";
import type { Context } from "hono";

/**
 * Generates a random string of specified length from
 * uppercase letters, lowercase letters, and digits.
 */
function generateRandomSecret(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    result += chars[index];
  }
  return result;
}

/**
 * Generates a random string of specified length from
 * lowercase letters and digits. Used for tenant schemas.
 */
function generateRandomSchemaName(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    result += chars[index];
  }
  return result;
}

async function postTenantCreateNewTenantLoginRecord(
  c: Context
): Promise<Response> {
  console.log("postTenantCreateNewTenantLoginRecord function begin");

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Check how many records have used = false
    const countQuery = `
      SELECT COUNT(*)::int AS cnt
      FROM system_schema.system_tenant_login
      WHERE used = false
    `;
    const countResult = await client.query(countQuery);
    const currentFalseCount = countResult.rows[0].cnt;

    if (currentFalseCount >= 5) {
      await client.query("ROLLBACK");
      return c.json(
        {
          message: "used limit reached. Need not to create a new tenant login.",
        },
        400
      );
    }

    // Query only records where tenant_host starts with "membi-"
    const lastHostQuery = `
      SELECT tenant_host
      FROM system_schema.system_tenant_login
      WHERE tenant_host LIKE 'membi-%'
      ORDER BY tenant_login_id DESC
      LIMIT 1
    `;
    const lastHostResult = await client.query(lastHostQuery);

    let nextNumber = 1;
    if (lastHostResult.rowCount && lastHostResult.rowCount > 0) {
      // e.g. "membi-0002"
      const lastHost = lastHostResult.rows[0].tenant_host;
      const parts = lastHost.split("-");
      if (parts.length >= 2) {
        const lastNumber = parseInt(parts[1], 10);
        nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
      }
    }

    // If there's no record, this will remain "membi-0001"
    const paddedNumber = nextNumber.toString().padStart(4, "0"); // "0001", "0002", ...
    const tenantHost = `membi-${paddedNumber}`;
    const adminHost = `membi-${paddedNumber}-admin`;

    const tenantHostForSecrets = tenantHost.replace("-", "_");

    // Use generateRandomSchemaName() for tenant_schema
    const schemaPart = generateRandomSchemaName(6);
    const tenantSchema = `${tenantHostForSecrets}_${schemaPart}`;

    // Use generateRandomSecret() for admin_secret and customer_secret
    const adminSecretPart = generateRandomSecret(6);
    const customerSecretPart = generateRandomSecret(6);

    const adminSecret = `${tenantHostForSecrets}_ad_${adminSecretPart}`;
    const customerSecret = `${tenantHostForSecrets}_cu_${customerSecretPart}`;

    // Insert the new record
    const insertQuery = `
      INSERT INTO system_schema.system_tenant_login (
        tenant_id,
        tenant_host,
        tenant_schema,
        tenant_user,
        tenant_password,
        used,
        admin_secret,
        customer_secret,
        app_domain,
        admin_host
      )
      VALUES (
        NULL,
        $1,
        $2,
        'abc',
        'abc',
        false,
        $3,
        $4,
        '.up.railway.app',
        $5
      )
      RETURNING tenant_login_id
    `;
    const insertParams = [
      tenantHost,
      tenantSchema,
      adminSecret,
      customerSecret,
      adminHost,
    ];
    const insertResult = await client.query(insertQuery, insertParams);

    await client.query("COMMIT");

    return c.json({
      message: "New tenant login record created",
      tenant_login_id: insertResult.rows[0].tenant_login_id,
      tenant_host: tenantHost,
      tenant_schema: tenantSchema,
      admin_secret: adminSecret,
      customer_secret: customerSecret,
      admin_host: adminHost,
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Error creating tenant login record:", err);
    return c.json({ message: "Failed to create new tenant record" }, 500);
  } finally {
    client?.release();
  }
}

export default postTenantCreateNewTenantLoginRecord;
