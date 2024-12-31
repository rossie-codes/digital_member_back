// src/controllers/member_controllers/member_redemption_item/get_member_redemption_item_list.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface RedemptionItemRecord {
  redemption_item_id: number;
  redemption_item_name: string;
  valid_until: string;
}

async function getMemberRedemptionItemRecord(
  c: Context
): Promise<RedemptionItemRecord[]> {

  const user = c.get("user"); // Retrieve the user from context
  const member_id = user.memberId;
  
  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

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
        AND rr.end_date > NOW()
    `;
    const values = [member_id];

    const result = await pool.query(query, values);

    const memberRedemptionItemRecord: RedemptionItemRecord[] = result.rows.map(
      (row) => ({
        redemption_record_id: row.redemption_record_id,
        redemption_item_id: row.redemption_item_id,
        redemption_item_name: row.redemption_item_name,
        valid_until: row.valid_until ? row.valid_until.toISOString() : null,
      })
    );

    return memberRedemptionItemRecord;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMemberRedemptionItemRecord;