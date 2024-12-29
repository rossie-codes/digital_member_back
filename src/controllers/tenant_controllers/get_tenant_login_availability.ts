import { pool } from "../db";
import { type Context } from "hono";

interface TenantLoginAvailability {
  tenant_id: number;
  used: boolean;
  tenant_login_id: number;
  tenant_schema: string;
  tenant_host: string;
  service_created: boolean;
  column_used_with_false_value: number;
  admin_secret: string;
  customer_secret: string;  
}

export async function getTenantLoginAvailability(c: Context): Promise<TenantLoginAvailability[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT
        tenant_id,
        used,
        tenant_login_id,
        tenant_schema,
        tenant_host,
        service_created,
        admin_secret,
        customer_secret,
        (SELECT COUNT(*) FROM system_schema.system_tenant_login WHERE used = false) AS column_used_with_false_value
      FROM system_schema.system_tenant_login
      WHERE used = false
      ORDER BY tenant_login_id ASC
    `;
    const result = await client.query(query);

    return result.rows.map((row) => ({
      tenant_id: row.tenant_id,
      used: row.used,
      tenant_login_id: row.tenant_login_id,
      tenant_schema: row.tenant_schema,
      tenant_host: row.tenant_host,
      service_created: row.service_created,
      admin_secret: row.admin_secret,
      customer_secret: row.customer_secret,
      column_used_with_false_value: parseInt(row.column_used_with_false_value, 10),
    }));
  } finally {
    client.release();
  }
}

export default getTenantLoginAvailability;