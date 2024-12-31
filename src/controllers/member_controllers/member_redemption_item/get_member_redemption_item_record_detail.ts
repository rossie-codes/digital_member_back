// src/controllers/member_controllers/member_redemption_item/get_member_redemption_item_record_detail.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface MemberRedemptionItemRecordDetail {
  redemption_item_id: number;
  redemption_item_name: string;
  redemption_type: 'fixed_amount' | 'percentage';
  discount_amount: number;
  validity_period: number;
  valid_from: string | null;
  valid_until: string | null;
  redeem_point: number;
  redemption_content: string;
  redemption_term: string;
  redemption_record_id: number;
  redeem_code: string;
  received_date: string;
  end_date: string;
}

async function getMemberRedemptionItemRecordDetail(
  c: Context
): Promise<MemberRedemptionItemRecordDetail> {
  console.log('getMemberRedemptionItemRecordDetail function begin');
  
  const user = c.get("user"); // Retrieve the user from context
  const member_id = user.memberId;
  // Retrieve the redemption_record_id from request parameters
  const redemption_record_id = c.req.param('redemption_record_id');

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    const query = `
      SELECT
        ri.redemption_item_id,
        ri.redemption_item_name,
        ri.redemption_type,
        ri.discount_amount,
        ri.validity_period,
        ri.valid_from,
        ri.valid_until,
        ri.redeem_point,
        ri.redemption_content,
        ri.redemption_term,
        rr.redemption_record_id,
        rr.redeem_code,
        rr.received_date,
        rr.end_date
      FROM
        redemption_record rr
      INNER JOIN
        redemption_item ri ON rr.redemption_item_id = ri.redemption_item_id
      WHERE
        rr.redemption_record_id = $1
        AND rr.member_id = $2
    `;
    const values = [redemption_record_id, member_id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Redemption record not found');
    }

    const row = result.rows[0];

    const memberRedemptionItemRecordDetail: MemberRedemptionItemRecordDetail = {
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
      redemption_record_id: row.redemption_record_id,
      redeem_code: row.redeem_code,
      received_date: row.received_date ? row.received_date.toISOString() : null,
      end_date: row.end_date ? row.end_date.toISOString() : null,
    };

    return memberRedemptionItemRecordDetail;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMemberRedemptionItemRecordDetail;