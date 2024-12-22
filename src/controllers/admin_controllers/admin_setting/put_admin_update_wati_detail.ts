// src/controllers/admin_controllers/admin_setting/put_admin_update_wati_detail.ts

// import { pool } from "../../db";
import { getTenantClient } from "../../db";
import type { Context } from "hono";
import crypto from "crypto";

// Define the request interface
interface UpdateWatiDetail {
  wati_api_endpoint?: string;
  wati_access_token?: string;
}

// Encryption key and algorithm (ensure the encryption key is securely managed)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-encryption-key-here"; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16 bytes

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

async function putAdminUpdateWatiDetail(c: Context): Promise<Response> {
  console.log("putAdminUpdateWatiDetail function begin");

  const tenant = c.get("tenant_host");
  // const tenant = 'https://mm9_client'
  // const tenant = 'https://membi-admin'

  console.log("tenant", tenant);

  const client = await getTenantClient(tenant);

  try {
    // Parse request body
    const { wati_api_endpoint, wati_access_token }: UpdateWatiDetail =
      await c.req.json();

    // Begin transaction
    // const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Prepare update statements
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (wati_api_endpoint !== undefined) {
        const encryptedEndpoint = encrypt(wati_api_endpoint);
        updateFields.push(`wati_end_point = $${paramIndex++}`);
        updateValues.push(encryptedEndpoint);
      }

      if (wati_access_token !== undefined) {
        const encryptedToken = encrypt(wati_access_token);
        updateFields.push(`wati_access_token = $${paramIndex++}`);
        updateValues.push(encryptedToken);
      }

      if (updateFields.length > 0) {
        // Update the admin_setting table
        const updateQuery = `
          UPDATE admin_setting
          SET ${updateFields.join(", ")}
          WHERE admin_setting_id = 1
        `;
        await client.query(updateQuery, updateValues);
      }

      await client.query("COMMIT");
      console.log("putAdminUpdateWatiDetail function end");
      return c.json({ message: "WATI details updated successfully" }, 200);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error updating WATI details:", error);
      throw new Error("WATI details update failed");
    }
  } catch (error) {
    console.error("Update error:", error);
    return c.json({ message: "WATI details update failed" }, 500);
  } finally {
    client.release();
  }
}

export default putAdminUpdateWatiDetail;
