// src/controllers/member_controllers/member_redemption_item/post_member_redemption_item_redeem.ts

import { getTenantClient } from "../../db";
import type { Context } from "hono";
import createShopifyDiscountCodeRedeem from "../../../shopify/post_shopify_new_discount_code_redeem";

interface DiscountInput {
  discount_code_name: string;
  discount_type: 'fixed_amount' | 'percentage';
  discount_amount?: number;
  discount_percentage?: number;
  minimum_spending: number;
  fixed_discount_cap?: number;
  use_limit_type: 'single_use';
  valid_from: string;
  valid_until: string;
}

async function postMemberRedemptionItemRedeem(c: Context): Promise<Response> {
  
  const user = c.get('user'); // Assuming user is set in context
  const member_id = user.memberId;



  try {
    // Get redemption_item_id from request body
    const { redemption_item_id } = await c.req.json();

    // Begin transaction
    // const client = await pool.connect();

    const tenant = c.get("tenant_host");
    console.log("tenant", tenant);
    const client = await getTenantClient(tenant);
    
    try {
      await client.query('BEGIN');

      // Get member's current points and member_phone
      const memberQuery = `
        SELECT points_balance, member_phone
        FROM member
        WHERE member_id = $1
        FOR UPDATE
      `;
      const memberResult = await client.query(memberQuery, [member_id]);
      if (memberResult.rows.length === 0) {
        throw new Error('Member not found');
      }
      const memberPoint = parseInt(memberResult.rows[0].points_balance, 10);
      const member_phone = memberResult.rows[0].member_phone;

      // Get redemption_item details
      const redemptionItemQuery = `
        SELECT
          redeem_point,
          redemption_item_name,
          redemption_type,
          discount_amount,
          minimum_spending,
          fixed_discount_cap,
          validity_period
        FROM redemption_item
        WHERE redemption_item_id = $1
      `;
      const redemptionItemResult = await client.query(redemptionItemQuery, [redemption_item_id]);
      if (redemptionItemResult.rows.length === 0) {
        throw new Error('Redemption item not found');
      }
      const redemptionItem = redemptionItemResult.rows[0];

      const redeemPointRequired = parseInt(redemptionItem.redeem_point, 10);

      // Check if member has enough points
      if (memberPoint < redeemPointRequired) {
        await client.query('ROLLBACK');
        return c.json({ message: 'Insufficient points' }, 400);
      }

      // Prepare discountInput
      const discount_code_name = `redemption from ${member_phone}`;
      const use_limit_type = 'single_use';
      const discount_type = redemptionItem.redemption_type; // 'fixed_amount' or 'percentage'
      const minimum_spending = parseFloat(redemptionItem.minimum_spending) || 0;
      const discountAmount = redemptionItem.discount_amount ? parseFloat(redemptionItem.discount_amount) : undefined;
      const fixedDiscountCap = redemptionItem.fixed_discount_cap ? parseFloat(redemptionItem.fixed_discount_cap) : undefined;
      const validity_period = redemptionItem.validity_period;

      const valid_from = new Date().toISOString();
      const valid_until = new Date(new Date().setMonth(new Date().getMonth() + validity_period)).toISOString(); // Adding validity_period months

      const discountInput: DiscountInput = {
        discount_code_name,
        discount_type,
        minimum_spending,
        use_limit_type,
        valid_from,
        valid_until,
        ...(discount_type === 'fixed_amount' && discountAmount !== undefined && { discount_amount: discountAmount }),
        ...(discount_type === 'percentage' && discountAmount !== undefined && { discount_percentage: discountAmount }),
        ...(fixedDiscountCap !== undefined && { fixed_discount_cap: fixedDiscountCap }),
      };

      console.log('valid_until:', valid_until);
      
      // Call createShopifyDiscountCodeRedeem
      const discountCodeData = await createShopifyDiscountCodeRedeem(discountInput);

      // Assuming discountCodeData contains redeem_code and webstore_redeem_code_id
      const { redeem_code, webstore_redeem_code_id } = discountCodeData;

      // Deduct points from member
      const updateMemberQuery = `
        UPDATE member
        SET points_balance = points_balance - $1
        WHERE member_id = $2
      `;
      await client.query(updateMemberQuery, [redeemPointRequired, member_id]);

      // Insert into redemption_record
      const insertRedemptionRecordQuery = `
        INSERT INTO redemption_record
          (member_id, redemption_item_id, redeem_point, redeem_code, webstore_redeem_code_id, end_date)
        VALUES
          ($1, $2, $3, $4, $5, $6)
      `;
      await client.query(insertRedemptionRecordQuery, [
        member_id,
        redemption_item_id,
        redeemPointRequired,
        redeem_code,
        webstore_redeem_code_id,
        valid_until
      ]);

      await client.query('COMMIT');

      return c.json({ message: 'Redemption successful', redeem_code }, 200);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during redemption:', error);
      throw new Error('Redemption failed');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Redemption error:', error);
    return c.json({ message: 'Redemption failed' }, 500);
  }
}

export default postMemberRedemptionItemRedeem;