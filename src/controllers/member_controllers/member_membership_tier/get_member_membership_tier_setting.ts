// src/controllers/member_controllers/member_member/get_membership_tier_setting.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface MembershipTierSetting {
  membership_tier_id: number;
  membership_tier_name: string;
  membership_tier_sequence: number;
  require_point: number;
  extend_membership_point: number;
  point_multiplier: number;
  membership_period: number;
}

async function getMembershipTierSetting(
  c: Context
): Promise<MembershipTierSetting[]> {
  
  
  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);
  
  try {
    const query = `
      SELECT
        membership_tier_id,
        membership_tier_name,
        membership_tier_sequence,
        require_point,
        extend_membership_point,
        point_multiplier,
        membership_period
      FROM membership_tier
      ORDER BY membership_tier_sequence ASC
    `;

    const result = await pool.query(query);

    const membershipTiers: MembershipTierSetting[] = result.rows.map((row) => ({
      membership_tier_id: row.membership_tier_id,
      membership_tier_name: row.membership_tier_name,
      membership_tier_sequence: row.membership_tier_sequence,
      require_point: row.require_point,
      extend_membership_point: row.extend_membership_point,
      point_multiplier: parseFloat(row.point_multiplier),
      membership_period: row.membership_period,
    }));

    return membershipTiers;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMembershipTierSetting;