// src/controllers/member_controllers/member_member_order/get_member_member_order_list.ts

import { pool } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface MemberOrder {
  order_id: number;
  total_price: number;
  webstore_order_number: string;
  order_created_date: string;
  delivery_date: string | null;
  line_item_id: number;
  product_id: string;
  sku: string;
  item_name: string;
  point_earning_id: number | null;
  point_earning: number | null;
}

async function getMemberMemberOrderList(
  c: Context
): Promise<MemberOrder[]> {
  const user = c.get('user'); // Assuming user is set in context
  
  const member_id = user.memberId;

  try {
    // Get member_phone using member_id
    const memberQuery = `
      SELECT member_phone
      FROM member
      WHERE member_id = $1
    `;
    const memberResult = await pool.query(memberQuery, [member_id]);


    if (memberResult.rows.length === 0) {
      throw new Error('Member not found');
    }

    const member_phone = memberResult.rows[0].member_phone;

    // Use member_phone to find orders
    const query = `
      SELECT
        o.order_id,
        o.total_price,
        o.webstore_order_number,
        o.order_created_date,
        o.delivery_date,
        oli.line_item_id,
        oli.product_id,
        oli.sku,
        oli.item_name,
        per.point_earning_id,
        per.point_earning
      FROM
        member_order o
        INNER JOIN order_line_items oli ON o.order_id = oli.order_id
        LEFT JOIN point_earning_record per ON per.order_id = o.order_id AND per.member_id = $2
      WHERE
        o.customer_phone = $1
      ORDER BY
        o.order_created_date DESC
    `;
    const values = [member_phone, member_id];

    const result = await pool.query(query, values);

    const memberOrders: MemberOrder[] = result.rows.map((row) => ({
      order_id: row.order_id,
      total_price: parseFloat(row.total_price),
      webstore_order_number: row.webstore_order_number,
      order_created_date: row.order_created_date.toISOString(),
      delivery_date: row.delivery_date ? row.delivery_date.toISOString() : null,
      line_item_id: row.line_item_id,
      product_id: row.product_id,
      sku: row.sku,
      item_name: row.item_name,
      point_earning_id: row.point_earning_id || null,
      point_earning: row.point_earning || null,
    }));

    return memberOrders;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getMemberMemberOrderList;