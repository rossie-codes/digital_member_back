// src/controllers/admin_controllers/admin_setting/put_admin_update_profile_detail.ts

// import { pool } from "../../db";
import { getTenantClient } from "../../db";
import type { Context } from "hono";
import Bun from "bun"; // Assuming Bun.js is available

// Define the request interface
interface UpdateProfileDetail {
  current_password?: string;
  new_password?: string;
}

async function putAdminUpdateProfileDetail(c: Context): Promise<Response> {
  console.log("putAdminUpdateProfileDetail function begin");

  const user = c.get("user"); // Retrieve the user from context
  const admin_id = user.adminId;

  console.log("admin_id", admin_id);

  try {
    // Parse request body
    const { current_password, new_password }: UpdateProfileDetail =
      await c.req.json();

    // Input validation
    if (!current_password || !new_password) {
      return c.json(
        { message: "Current password and new password are required" },
        400
      );
    }

    // Begin transaction
    // const client = await pool.connect();
    const tenant = c.get("tenant");
    // const tenant = 'https://mm9_client'
    // const tenant = 'https://membi-admin'

    console.log("tenant", tenant);

    const client = await getTenantClient(tenant);

    try {
      await client.query("BEGIN");

      // Retrieve current password hash
      const passwordQuery = `
        SELECT admin_password_hash
        FROM admin_login
        WHERE admin_id = $1
      `;
      const passwordResult = await client.query(passwordQuery, [admin_id]);

      if (passwordResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return c.json({ message: "Admin not found" }, 404);
      }

      const storedHash = passwordResult.rows[0].admin_password_hash;

      // Compare current_password with stored hash using Bun.password.verify
      const passwordMatch = await Bun.password.verify(
        current_password,
        storedHash
      );

      console.log("passwordMatch", passwordMatch);

      if (!passwordMatch) {
        await client.query("ROLLBACK");
        return c.json({ message: "Current password is incorrect" }, 400);
      }

      // Hash the new password using Bun.password.hash
      const newPasswordHash = await Bun.password.hash(new_password);

      console.log("newPasswordHash", newPasswordHash);

      // Update the password
      const updatePasswordQuery = `
        UPDATE admin_login
        SET admin_password_hash = $1
        WHERE admin_id = $2
      `;
      await client.query(updatePasswordQuery, [newPasswordHash, admin_id]);

      await client.query("COMMIT");
      return c.json({ message: "Password updated successfully" }, 200);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error updating password:", error);
      throw new Error("Password update failed");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Update error:", error);
    return c.json({ message: "Password update failed" }, 500);
  }
}

export default putAdminUpdateProfileDetail;
