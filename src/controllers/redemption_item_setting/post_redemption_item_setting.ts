// src/controllers/redemption_item_setting/post_redemption_item_setting.ts

import { pool } from '../db';
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function postRedemptionItemSetting(c: Context): Promise<Response> {
  try {
    // Parse the request body
    const body = await c.req.json();

    // Extract common data from the payload
    const {
      redemption_name,
      discount_type,
      minimum_spending,
      validity_period,
      is_active,
      redeem_point
    } = body;

    // Validate common required fields
    if (
      typeof redemption_name !== 'string' ||
      !redemption_name.trim() ||
      !['fixed_amount', 'percentage'].includes(discount_type) ||
      typeof minimum_spending !== 'number' ||
      typeof validity_period !== 'number' ||
      typeof is_active !== 'boolean' ||
      typeof redeem_point !== 'number'
    ) {
      throw new HTTPException(400, { message: 'Invalid input data' });
    }

    // Map is_active to status
    // const status = is_active ? 'active' : 'inactive';

    // Calculate valid_from and valid_until
    const valid_from = new Date();
    const valid_until = new Date(valid_from);
    valid_until.setMonth(valid_until.getMonth() + validity_period);

    // Prepare values common to both discount types
    const redemption_item_name = redemption_name.trim();
    const minSpending = parseFloat(minimum_spending.toFixed(2)); // Ensure two decimal places

    // Initialize variables for fields that may or may not be present
    let discountAmount: number | null = null;
    let fixedDiscountCap: number | null = null;

    // Validate and assign fields based on discount_type
    if (discount_type === 'fixed_amount') {
      const { discount_amount } = body;
      if (typeof discount_amount !== 'number') {
        throw new HTTPException(400, { message: 'Invalid or missing discount_amount for fixed_amount discount type' });
      }
      discountAmount = parseFloat(discount_amount.toFixed(2)); // Ensure two decimal places
      fixedDiscountCap = null; // Not applicable for fixed_amount
    } else if (discount_type === 'percentage') {
      const { discount_percentage, fixed_discount_cap } = body;
      if (
        typeof discount_percentage !== 'number' ||
        typeof fixed_discount_cap !== 'number'
      ) {
        throw new HTTPException(400, { message: 'Invalid or missing discount_percentage or fixed_discount_cap for percentage discount type' });
      }
      discountAmount = parseFloat(discount_percentage.toFixed(2)); // Store as discount_amount in database
      fixedDiscountCap = parseFloat(fixed_discount_cap.toFixed(2));
    }

    // Optional fields (set to NULL or default values if not provided)
    const quantity_available = null; // Set as needed

    const insertQuery = `
      INSERT INTO redemption_item (
        redemption_item_name,
        discount_type,
        discount_amount,
        quantity_available,
        minimum_spending,
        fixed_discount_cap,
        validity_period,
        valid_from,
        valid_until,
        is_active,
        redeem_point
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING redemption_item_id
    `;

    const values = [
      redemption_item_name,
      discount_type,
      discountAmount,
      quantity_available,
      minSpending,
      fixedDiscountCap,
      validity_period,
      valid_from,
      valid_until,
      is_active,
      redeem_point
    ];

    // Get a database client from the pool
    const client = await pool.connect();

    try {
      // Start a transaction
      await client.query('BEGIN');

      // Insert the data
      const result = await client.query(insertQuery, values);

      // Commit the transaction
      await client.query('COMMIT');

      // Return success response
      return c.json(
        {
          message: 'Redemption item added successfully',
          redemption_item_id: result.rows[0].redemption_item_id
        },
        200
      );

    } catch (error) {
      // Roll back the transaction in case of error
      await client.query('ROLLBACK');
      console.error('Error during transaction:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      // Release the client back to the pool
      client.release();
    }

  } catch (error) {
    console.error('Error in postRedemptionItemSetting:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default postRedemptionItemSetting;