import { pool } from "../db";
import { type Context } from "hono";

interface TenantLoginAvailability {
  tenant_id: number;
  used: boolean;
  tenant_login_id: number;
  tenant_schema: string;
  tenant_host: string;
  service_created: boolean;
  used_count: number;
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
        (SELECT COUNT(*) FROM system_schema.system_tenant_login WHERE used = false) AS used_count
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
      used_count: parseInt(row.used_count, 10),
    }));
  } finally {
    client.release();
  }
}

export default getTenantLoginAvailability;