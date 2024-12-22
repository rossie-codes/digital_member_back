// import { pool } from "../../db";
import { getTenantClient } from "../../db";
import type { Context } from "hono";

interface WatiContent {
  body: string;
  footer: string;
  button_type: string;
  header_present: boolean;
}

async function getWatiTemplateDetail(c: Context): Promise<WatiContent> {

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    console.log("Fetching WATI template detail");
    const template_name = c.req.param("wati_template_name"); // Changed line


    if (!template_name) {
      throw new Error(`template_name query parameter is required`);
    }

    const query = `
      SELECT body, footer, button_type, header_present
      FROM wati_template
      WHERE element_name = $1
    `;
    const values = [template_name];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      throw new Error(`Template "${template_name}" not found`);
    }

    const { body, footer, button_type, header_present } = result.rows[0];

    const wati_content = { body, footer, button_type, header_present };

    return wati_content

  } catch (error) {
    console.error("Database query error:", error);
    throw new Error('Database query failed');
  } finally {
    pool.release();
  }
}

export default getWatiTemplateDetail;