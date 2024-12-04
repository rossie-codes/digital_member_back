// src/controllers/member_controllers/member_member/put_member_update_profile_detail.ts

import { pool } from "../../db";
import type { Context } from "hono";
import bcrypt from "bcryptjs";

// Define the response interface
interface UpdateProfileDetail {
  member_name?: string;
  birthday?: string | null;
  current_password?: string;
  new_password?: string;
}

async function putMemberUpdateProfileDetail(c: Context): Promise<Response> {
  const user = c.get("user"); // Retrieve the user from context
  const member_id = user.memberId;

  try {
    // Parse request body
    const {
      member_name,
      birthday,
      current_password,
      new_password,
    }: UpdateProfileDetail = await c.req.json();

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update member profile if member_name or birthday is provided
      if (member_name !== undefined || birthday !== undefined) {
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;

        if (member_name !== undefined) {
          updateFields.push(`member_name = $${paramIndex++}`);
          updateValues.push(member_name);
        }
        if (birthday !== undefined) {
          updateFields.push(`birthday = $${paramIndex++}`);
          updateValues.push(birthday);
        }

        if (updateFields.length > 0) {
          const updateMemberQuery = `
            UPDATE member
            SET ${updateFields.join(", ")}
            WHERE member_id = $${paramIndex}
          `;
          updateValues.push(member_id);
          await client.query(updateMemberQuery, updateValues);
        }
      }

      // Update password if current_password and new_password are provided
      if (current_password !== undefined && new_password !== undefined) {
        // Retrieve current password hash
        const passwordQuery = `
          SELECT member_password_hash
          FROM member_login
          WHERE member_id = $1
        `;
        const passwordResult = await client.query(passwordQuery, [member_id]);

        if (passwordResult.rows.length === 0) {
          await client.query("ROLLBACK");
          return c.json({ message: "Member login not found" }, 404);
        }

        const storedHash = passwordResult.rows[0].member_password_hash;

        console.log("Stored hash:", storedHash);
        console.log("Current password:", current_password);
        // Compare current_password with stored hash
        const passwordMatch = await Bun.password.verify(current_password, storedHash);
        // const passwordMatch = await bcrypt.compare(
        //   current_password,
        //   storedHash
        // );

        console.log("Password match:", passwordMatch);

        if (!passwordMatch) {
          console.log("Password match in if :", passwordMatch);
          await client.query("ROLLBACK");
          return c.json({ message: "Current password is incorrect" }, 400);
        }

        // Hash the new password
        const newPasswordHash = await Bun.password.hash(new_password);

        // const saltRounds = await bcrypt.genSalt(10);
        // const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

        console.log("trying to update password");

        // Update the password
        const updatePasswordQuery = `
          UPDATE member_login
          SET member_password_hash = $1
          WHERE member_id = $2
        `;
        await client.query(updatePasswordQuery, [newPasswordHash, member_id]);
      }

      await client.query("COMMIT");

      console.log("updated password");

      return c.json({ message: "Profile updated successfully" }, 200);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error updating profile:", error);
      throw new Error("Profile update failed");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Update error:", error);
    return c.json({ message: "Profile update failed" }, 500);
  }
}

export default putMemberUpdateProfileDetail;