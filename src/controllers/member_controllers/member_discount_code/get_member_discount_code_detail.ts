// src/controllers/member_controllers/member_discount_code/get_member_discount_code_detail.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface MemberDiscountCodeDetail {
  discount_code_id: number;
  discount_code_name: string;
  valid_until: string;
  discount_code: string;
  discount_type: string;
  discount_amount: number;
  discount_code_content: string;
  discount_code_term: string;
}

async function getMemberDiscountCodeDetail(
  c: Context
): Promise<MemberDiscountCodeDetail> {
  console.log("getMemberDiscountCodeDetail function begin");

  const user = c.get("user");
  console.log("user is:", user);
  const member_id = user.memberId;
  console.log("member_id is:", member_id);
  const discountCodeId = c.req.param("discount_code_id");
  console.log("discount_code_id is:", discountCodeId);

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    const query = `
      SELECT 
        discount_code_id,
        discount_code_name,
        valid_until,
        discount_code,
        discount_type::text,
        discount_amount,
        discount_code_content,
        discount_code_term
      FROM discount_code
      WHERE discount_code_id = $1
        AND discount_code_status = 'active'
        AND deleted_status = false
    `;
    const values = [discountCodeId];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Discount code not found");
    }

    const row = result.rows[0];

    const memberDiscountCodeDetail: MemberDiscountCodeDetail = {
      discount_code_id: row.discount_code_id,
      discount_code_name: row.discount_code_name,
      valid_until: row.valid_until.toISOString(),
      discount_code: row.discount_code,
      discount_type: row.discount_type,
      discount_amount: parseFloat(row.discount_amount),
      discount_code_content: row.discount_code_content,
      discount_code_term: row.discount_code_term,
    };

    console.log("getMemberDiscountCodeDetail function end");
    return memberDiscountCodeDetail;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  } finally {
    pool.release();
  }
}

export default getMemberDiscountCodeDetail;
