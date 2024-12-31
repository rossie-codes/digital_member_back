// src/controllers/member_controllers/member_member/get_member_redemption_page_card.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface MemberRedemptionPageCard {
  member_name: string;
  membership_tier_id: number;
  membership_tier_name: string;
  points_balance: number;
  next_membership_tier_id: number | null;
  next_membership_tier_name: string | null;
  next_membership_tier_point: number | null;
  point_to_next_tier: number | null;
}

async function getMemberRedemptionPageCard(
  c: Context
): Promise<MemberRedemptionPageCard> {
  
  const user = c.get('user'); // Retrieve the user from context
  const member_id = user.memberId;

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    // Get member details along with current membership tier
    const memberQuery = `
      SELECT 
        m.member_name, 
        m.membership_tier_id, 
        mt.membership_tier_name, 
        mt.membership_tier_sequence,
        m.points_balance
      FROM member m
      LEFT JOIN membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      WHERE m.member_id = $1
    `;
    const memberValues = [member_id];

    const memberResult = await pool.query(memberQuery, memberValues);

    if (memberResult.rows.length === 0) {
      throw new Error('Member not found');
    }

    const memberRow = memberResult.rows[0];

    const currentTierSequence = memberRow.membership_tier_sequence;

    // Get the next membership tier, if any
    const nextTierQuery = `
      SELECT 
        membership_tier_id,
        membership_tier_name,
        require_point
      FROM membership_tier
      WHERE membership_tier_sequence > $1
      ORDER BY membership_tier_sequence ASC
      LIMIT 1
    `;
    const nextTierValues = [currentTierSequence];

    const nextTierResult = await pool.query(nextTierQuery, nextTierValues);

    let nextTierRow = null;
    if (nextTierResult.rows.length > 0) {
      nextTierRow = nextTierResult.rows[0];
    }

    const point_to_next_tier = nextTierRow
      ? Math.max(0, nextTierRow.require_point - memberRow.points_balance)
      : null;

    const memberRedemptionPageCard: MemberRedemptionPageCard = {
      member_name: memberRow.member_name,
      membership_tier_id: memberRow.membership_tier_id,
      membership_tier_name: memberRow.membership_tier_name,
      points_balance: memberRow.points_balance,
      next_membership_tier_id: nextTierRow ? nextTierRow.membership_tier_id : null,
      next_membership_tier_name: nextTierRow ? nextTierRow.membership_tier_name : null,
      next_membership_tier_point: nextTierRow ? nextTierRow.require_point : null,
      point_to_next_tier: point_to_next_tier,
    };

    return memberRedemptionPageCard;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMemberRedemptionPageCard;