import { pool } from "../db";
import type { Context } from "hono";

/**
 * Generates a random string of specified length from
 * uppercase letters, lowercase letters, and digits.
 */
function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    result += chars[index];
  }
  return result;
}

/**
 * Generates three unique random strings of specified length.
 */
function generateThreeUniqueStrings(length: number): [string, string, string] {
  const set = new Set<string>();
  while (set.size < 3) {
    set.add(generateRandomString(length));
  }
  const [str1, str2, str3] = Array.from(set);
  return [str1, str2, str3];
}

async function postTenantCreateNewTenantLoginRecord(c: Context): Promise<Response> {
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
      return c.json({ message: "used limit reached. Need not to create a new tenant login." }, 400);
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
      const lastHost = lastHostResult.rows[0].tenant_host; // e.g. "membi-0002"
      const parts = lastHost.split("-");
      if (parts.length >= 2) {
        const lastNumber = parseInt(parts[1], 10);
        nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
      }
    }

    // If there's no record, this will remain "membi-0001"
    const paddedNumber = nextNumber.toString().padStart(4, "0"); // "0001", "0002", ...
    const tenantHost = `membi-${paddedNumber}`;

    // Generate three distinct random strings for schema/admin/customer secrets
    const [schemaRand, adminRand, customerRand] = generateThreeUniqueStrings(6);

    const tenantSchema = `${tenantHost}-${schemaRand}`;
    const adminSecret = `${tenantHost}-ad-${adminRand}`;
    const customerSecret = `${tenantHost}-cu-${customerRand}`;

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
        app_domain
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
        '.up.railway.app'
      )
      RETURNING tenant_login_id
    `;
    const insertParams = [tenantHost, tenantSchema, adminSecret, customerSecret];
    const insertResult = await client.query(insertQuery, insertParams);

    await client.query("COMMIT");

    return c.json({
      message: "New tenant login record created",
      tenant_login_id: insertResult.rows[0].tenant_login_id,
      tenant_host: tenantHost,
      tenant_schema: tenantSchema,
      admin_secret: adminSecret,
      customer_secret: customerSecret,
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