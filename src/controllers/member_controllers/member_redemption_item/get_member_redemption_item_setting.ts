// src/controllers/member_controllers/member_redemption_item/get_member_redemption_item_setting.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface RedemptionItemSetting {
  redemption_item_id: number;
  redemption_item_name: string;
  redemption_type: 'fixed_amount' | 'percentage';
  redeem_point: number;
}

async function getMemberRedemptionItemSetting(
  c: Context
): Promise<RedemptionItemSetting[]> {

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    const query = `
      SELECT redemption_item_id, redemption_item_name, redemption_type, redeem_point
      FROM redemption_item
      WHERE deleted_status = false AND redemption_item_status = 'active'
    `;

    const result = await pool.query(query);

    const redemptionItems: RedemptionItemSetting[] = result.rows.map((row) => ({
      redemption_item_id: row.redemption_item_id,
      redemption_item_name: row.redemption_item_name,
      redemption_type: row.redemption_type,
      redeem_point: row.redeem_point,
    }));

    return redemptionItems;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMemberRedemptionItemSetting;