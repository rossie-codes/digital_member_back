// src/controllers/member_controllers/member_member/get_member_dashboard_card.ts

import { pool } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface MemberOrderCard {
  member_id: number;
  member_name: string;
  count_member_order: number;
}

async function getMemberMemberOrderCard(c: Context): Promise<MemberOrderCard> {
  console.log('getMemberDashboardCard function begin');

  // Retrieve the user from context (assuming you've set it using middleware)
  const user = c.get('user');
  console.log('user is:', user);

  const member_id = user.memberId;
  console.log('member_id is:', member_id);

  try {
    const query = `
      SELECT
        m.member_id,
        m.member_name,
        COUNT(o.order_id) AS count_member_order
      FROM
        member m
      LEFT JOIN
        member_order o ON o.customer_phone = m.member_phone
        AND o.order_created_date >= (NOW() - INTERVAL '12 months')
      WHERE
        m.member_id = $1
      GROUP BY
        m.member_id,
        m.member_name;
    `;
    const values = [member_id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Member not found');
    }

    const row = result.rows[0];

    const memberDashboardCard: MemberOrderCard = {
      member_id: row.member_id,
      member_name: row.member_name,
      count_member_order: parseInt(row.count_member_order, 10),
    };

    console.log('getMemberDashboardCard function end');
    return memberDashboardCard;

  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMemberMemberOrderCard;