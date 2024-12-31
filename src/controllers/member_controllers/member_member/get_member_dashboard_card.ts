// src/controllers/member_controllers/member_member/get_member_dashboard_card.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface MemberDashboardCard {
  member_name: string;
  membership_tier_id: number;
  membership_tier_name: string;
  points_balance: number;
  membership_expiry_date: string;
}

async function getMemberDashboardCard(c: Context): Promise<MemberDashboardCard> {
  console.log('getMemberDashboardCard function begin');

  const user = c.get('user'); // Retrieve the user from context
  console.log('user is:', user);
  const member_id = user.memberId;
  console.log('member_id is:', member_id);

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    const query = `
      SELECT 
        m.member_name, 
        m.membership_tier_id, 
        mt.membership_tier_name, 
        m.points_balance,
        m.membership_expiry_date
      FROM member m
      LEFT JOIN membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      WHERE m.member_id = $1
    `;
    const values = [member_id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Member not found');
    }

    const row = result.rows[0];

    const memberDashboardCard: MemberDashboardCard = {
      member_name: row.member_name,
      membership_tier_id: row.membership_tier_id,
      membership_tier_name: row.membership_tier_name,
      points_balance: row.points_balance,
      membership_expiry_date: row.membership_expiry_date.toISOString(), // Adjust as needed
    };

    console.log('getMemberDashboardCard function end');
    return memberDashboardCard;

  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMemberDashboardCard;