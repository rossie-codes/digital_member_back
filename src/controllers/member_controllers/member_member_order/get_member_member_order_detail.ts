// src/controllers/member_controllers/member_member_order/get_member_member_order_detail.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interfaces
interface MemberOrderDetail {
  order_id: number;
  total_price: number;
  webstore_order_number: string;
  order_created_date: string;
  delivery_date: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  point_earning_id: number | null;
  point_earning: number | null;
  discount_codes: OrderDiscountCode[];
  total_discount_amount: number;
  line_items: LineItem[];
}

interface LineItem {
  line_item_id: number;
  product_id: string;
  sku: string;
  item_name: string;
  item_qty: number;
  item_unit_price: number;
  item_subtotal_price: number;
  item_total_discount: number;
  item_total_price: number;
  line_item_discounts: LineItemDiscountCode[];
}

interface OrderDiscountCode {
  order_discount_id: number;
  discount_type: string;
  discount_code: string;
  discount_amount: number;
}

interface LineItemDiscountCode {
  line_item_discount_id: number;
  discount_type: string;
  discount_code: string;
  discount_amount: number;
}

async function getMemberMemberOrderDetail(
  c: Context
): Promise<MemberOrderDetail> {
  const user = c.get("user"); // Assuming user is set in context
  const member_id = user.memberId;

  // Retrieve the order_id from request parameters
  const order_id = c.req.param("order_id");

  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    // Get member_phone using member_id
    const memberQuery = `
      SELECT member_phone
      FROM member
      WHERE member_id = $1
    `;
    const memberResult = await pool.query(memberQuery, [member_id]);

    if (memberResult.rows.length === 0) {
      throw new Error("Member not found");
    }

    const member_phone = memberResult.rows[0].member_phone;

    // Verify that the order belongs to the member
    const orderQuery = `
      SELECT
        o.order_id,
        o.total_price,
        o.webstore_order_number,
        o.order_created_date,
        o.delivery_date,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.customer_address
      FROM
        member_order o
      WHERE
        o.order_id = $1
        AND o.customer_phone = $2
    `;
    const orderResult = await pool.query(orderQuery, [order_id, member_phone]);

    if (orderResult.rows.length === 0) {
      throw new Error("Order not found or does not belong to the member");
    }

    const orderRow = orderResult.rows[0];

    // Get points_balance earning information
    const pointEarningQuery = `
      SELECT
        point_earning_id,
        point_earning
      FROM
        point_earning_record
      WHERE
        order_id = $1
        AND member_id = $2
    `;
    const pointEarningResult = await pool.query(pointEarningQuery, [
      order_id,
      member_id,
    ]);

    const pointEarningRow = pointEarningResult.rows[0] || null;

    // Get order discounts
    const orderDiscountsQuery = `
      SELECT
        order_discount_id,
        discount_type,
        discount_code,
        discount_amount
      FROM
        order_discounts
      WHERE
        order_id = $1
    `;
    const orderDiscountsResult = await pool.query(orderDiscountsQuery, [
      order_id,
    ]);

    const discount_codes: OrderDiscountCode[] = orderDiscountsResult.rows.map(
      (row) => ({
        order_discount_id: row.order_discount_id,
        discount_type: row.discount_type,
        discount_code: row.discount_code,
        discount_amount: parseFloat(row.discount_amount),
      })
    );

    const totalOrderDiscountAmount = discount_codes.reduce(
      (acc, discount) => acc + discount.discount_amount,
      0
    );

    // Get line items
    const lineItemsQuery = `
      SELECT
        line_item_id,
        product_id,
        sku,
        item_name,
        item_qty,
        item_unit_price,
        item_subtotal_price,
        item_total_discount,
        item_total_price
      FROM
        order_line_items
      WHERE
        order_id = $1
    `;
    const lineItemsResult = await pool.query(lineItemsQuery, [order_id]);

    const lineItems: LineItem[] = [];

    for (const row of lineItemsResult.rows) {
      // Get line item discounts
      const lineItemDiscountsQuery = `
        SELECT
          line_item_discount_id,
          discount_type,
          discount_code,
          discount_amount
        FROM
          order_line_item_discounts
        WHERE
          order_line_item_id = $1
      `;
      const lineItemDiscountsResult = await pool.query(lineItemDiscountsQuery, [
        row.line_item_id,
      ]);

      const lineItemDiscounts: LineItemDiscountCode[] =
        lineItemDiscountsResult.rows.map((discountRow) => ({
          line_item_discount_id: discountRow.line_item_discount_id,
          discount_type: discountRow.discount_type,
          discount_code: discountRow.discount_code,
          discount_amount: parseFloat(discountRow.discount_amount),
        }));

      const lineItem: LineItem = {
        line_item_id: row.line_item_id,
        product_id: row.product_id,
        sku: row.sku,
        item_name: row.item_name,
        item_qty: row.item_qty,
        item_unit_price: parseFloat(row.item_unit_price),
        item_subtotal_price: parseFloat(row.item_subtotal_price),
        item_total_discount: parseFloat(row.item_total_discount),
        item_total_price: parseFloat(row.item_total_price),
        line_item_discounts: lineItemDiscounts,
      };

      lineItems.push(lineItem);
    }

    // Calculate total discount amount including line item discounts
    const totalLineItemDiscountAmount = lineItems.reduce(
      (acc, item) => acc + item.item_total_discount,
      0
    );

    const totalDiscountAmount =
      totalOrderDiscountAmount + totalLineItemDiscountAmount;

    const memberOrderDetail: MemberOrderDetail = {
      order_id: orderRow.order_id,
      total_price: parseFloat(orderRow.total_price),
      webstore_order_number: orderRow.webstore_order_number,
      order_created_date: orderRow.order_created_date.toISOString(),
      delivery_date: orderRow.delivery_date
        ? orderRow.delivery_date.toISOString()
        : null,
      customer_name: orderRow.customer_name,
      customer_email: orderRow.customer_email,
      customer_phone: orderRow.customer_phone,
      customer_address: orderRow.customer_address,
      point_earning_id: pointEarningRow
        ? pointEarningRow.point_earning_id
        : null,
      point_earning: pointEarningRow ? pointEarningRow.point_earning : null,
      discount_codes: discount_codes,
      total_discount_amount: totalDiscountAmount,
      line_items: lineItems,
    };

    return memberOrderDetail;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  } finally {
    pool.release();
  }
}

export default getMemberMemberOrderDetail;
