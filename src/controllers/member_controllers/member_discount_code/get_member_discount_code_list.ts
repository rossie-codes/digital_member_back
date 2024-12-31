// src/controllers/member_controllers/member_discount_code/get_member_discount_code_list.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface MemberDiscountCode {
  discount_code_id: number;
  discount_code_name: string;
  valid_until: string;
}

async function getMemberDiscountCode(
  c: Context
): Promise<MemberDiscountCode[]> {
  console.log("getMemberDiscountCode function begin");

  const user = c.get("user"); // Retrieve the user from context
  console.log("user is:", user);
  const member_id = user.memberId;
  console.log("member_id is:", member_id);

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    const query = `
      SELECT 
        discount_code_id,
        discount_code_name, 
        valid_until
      FROM discount_code
      WHERE discount_code_status = 'active' 
        AND deleted_status = false
    `;

    const result = await pool.query(query);


    const memberDiscountCodes: MemberDiscountCode[] = result.rows.map(
      (row) => ({
        discount_code_id: row.discount_code_id,
        discount_code_name: row.discount_code_name,
        valid_until: row.valid_until.toISOString(),
      })
    );

    console.log("getMemberDiscountCode function end");
    return memberDiscountCodes;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMemberDiscountCode;
