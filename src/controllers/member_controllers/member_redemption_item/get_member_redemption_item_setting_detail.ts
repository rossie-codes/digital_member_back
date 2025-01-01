// src/controllers/member_controllers/member_redemption_item/get_member_redemption_item_detail.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface MemberRedemptionItemDetail {
  redemption_item_id: number;
  redemption_item_name: string;
  redemption_type: "fixed_amount" | "percentage";
  discount_amount: number;
  validity_period: number;
  valid_from: string | null;
  valid_until: string | null;
  redeem_point: number;
  redemption_content: string;
  redemption_term: string;
}

async function getMemberRedemptionItemDetail(
  c: Context
): Promise<MemberRedemptionItemDetail> {
  // Retrieve the redemption_item_id from request parameters
  const redemptionItemId = c.req.param("redemption_item_id");

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    const query = `
      SELECT 
        redemption_item_id,
        redemption_item_name,
        redemption_type,
        discount_amount,
        validity_period,
        valid_from,
        valid_until,
        redeem_point,
        redemption_content,
        redemption_term
      FROM redemption_item
      WHERE redemption_item_id = $1
        AND deleted_status = false
        AND redemption_item_status = 'active'
    `;
    const values = [redemptionItemId];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Redemption item not found");
    }

    const row = result.rows[0];

    const memberRedemptionItemDetail: MemberRedemptionItemDetail = {
      redemption_item_id: row.redemption_item_id,
      redemption_item_name: row.redemption_item_name,
      redemption_type: row.redemption_type,
      discount_amount: parseFloat(row.discount_amount),
      validity_period: row.validity_period,
      valid_from: row.valid_from ? row.valid_from.toISOString() : null,
      valid_until: row.valid_until ? row.valid_until.toISOString() : null,
      redeem_point: row.redeem_point,
      redemption_content: row.redemption_content,
      redemption_term: row.redemption_term,
    };

    return memberRedemptionItemDetail;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  } finally {
    pool.release();
  }
}

export default getMemberRedemptionItemDetail;
