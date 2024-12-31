// src/controllers/member_controllers/member_member/get_member_profile_detail.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface ProfileDetail {
  member_name: string;
  created_at: string;
  birthday: string | null;
}

async function getProfileDetail(c: Context): Promise<ProfileDetail> {
  console.log('getProfileDetail function begin');

  const user = c.get('user'); // Retrieve the user from context
  console.log('user is:', user);
  const member_id = user.memberId;
  console.log('member_id is:', member_id);

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    const query = `
      SELECT
        member_name,
        created_at,
        birthday
      FROM member
      WHERE member_id = $1
    `;
    const values = [member_id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Member not found');
    }

    const row = result.rows[0];

    const memberProfileDetail: ProfileDetail = {
      member_name: row.member_name,
      created_at: row.created_at ? row.created_at.toISOString() : null,
      birthday: row.birthday ? row.birthday.toISOString() : null,
    };

    console.log('getProfileDetail function end');
    return memberProfileDetail;

  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getProfileDetail;