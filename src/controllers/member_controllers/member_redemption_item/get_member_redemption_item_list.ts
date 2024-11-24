// src/controllers/member_controllers/member_redemption_item/get_member_redemption_item_list.ts

import { pool } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface RedemptionItemCode {
  redemption_item_id: number;
  redemption_item_name: string;
  valid_until: string;
}

async function getMemberRedemptionItem(
  c: Context
): Promise<RedemptionItemCode[]> {
  console.log("getMemberRedemptionItem function begin");

  const user = c.get("user"); // Retrieve the user from context
  console.log("user is:", user);
  const member_id = user.memberId;

  console.log("member_id is:", member_id);

  try {
    const query = `
      SELECT 
        ri.redemption_item_id,
        ri.redemption_item_name,
        ri.valid_until
      FROM redemption_item ri
      INNER JOIN redemption_record rr ON ri.redemption_item_id = rr.redemption_item_id
      WHERE rr.member_id = $1
        AND ri.deleted_status = false
        AND ri.redemption_item_status = 'active'
    `;

    const values = [member_id];

    const result = await pool.query(query, values);

    const memberRedemptionItems: RedemptionItemCode[] = result.rows.map(
      (row) => ({
        redemption_item_id: row.redemption_item_id,
        redemption_item_name: row.redemption_item_name,
        valid_until: row.valid_until.toISOString(),
      })
    );

    console.log("getMemberRedemptionItem function end");
    return memberRedemptionItems;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMemberRedemptionItem;