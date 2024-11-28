// src/controllers/member_controllers/member_redemption_item/get_member_redemption_item_list.ts

import { pool } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface ExpiredRedemptionItemRecord {
  expired_redemption_item_id: number;
  expired_redemption_item_name: string;
  expired_valid_until: string;
}

async function getMemberExpiredRedemptionItemRecord(
  c: Context
): Promise<ExpiredRedemptionItemRecord[]> {
  const user = c.get("user"); // Retrieve the user from context
  const member_id = user.memberId;

  try {
    const query = `
      SELECT 
        rr.redemption_item_id, 
        rr.redemption_record_id,
        ri.redemption_item_name, 
        rr.end_date AS valid_until
      FROM 
        redemption_record rr
      INNER JOIN 
        redemption_item ri ON rr.redemption_item_id = ri.redemption_item_id
      WHERE 
        rr.member_id = $1
        AND rr.end_date < NOW()
    `;
    const values = [member_id];

    const result = await pool.query(query, values);

    const memberExpiredRedemptionItemRecord: ExpiredRedemptionItemRecord[] = result.rows.map(
      (row) => ({
        expired_redemption_record_id: row.redemption_record_id,
        expired_redemption_item_id: row.redemption_item_id,
        expired_redemption_item_name: row.redemption_item_name,
        expired_valid_until: row.valid_until ? row.valid_until.toISOString() : null,
      })
    );

    return memberExpiredRedemptionItemRecord;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMemberExpiredRedemptionItemRecord;