// src/controllers/redemption_item_setting/post_redemption_item_setting.ts

import { pool } from '../../db';
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function postRedemptionItemSetting(c: Context): Promise<Response> {
  try {
    // Parse the request body
    const body = await c.req.json();

    // Extract data from the payload
    const {
      redemption_item_name,
      redemption_type,
      minimum_spending,
      validity_period,
      is_active,
      redeem_point,
      discount_amount,
      discount_percentage,
      fixed_discount_cap,
      quantity_available,
      valid_from,
      valid_until,
      redemption_content,
      redemption_term,
    } = body;

    // Validate required fields
    if (
      typeof redemption_item_name !== 'string' ||
      !redemption_item_name.trim() ||
      !['fixed_amount', 'percentage'].includes(redemption_type) ||
      typeof minimum_spending !== 'number' ||
      typeof validity_period !== 'number' || // Ensure validity_period is provided as a number
      validity_period <= 0 || // Ensure validity_period is positive
      typeof is_active !== 'boolean' ||
      typeof redeem_point !== 'number' ||
      (typeof quantity_available !== 'number' || quantity_available < 0) ||
      typeof valid_from !== 'string' ||
      typeof valid_until !== 'string'
    ) {
      throw new HTTPException(400, { message: 'Invalid or missing required fields' });
    }

    // Parse valid_from and valid_until dates
    const validFromDate = new Date(valid_from);
    const validUntilDate = new Date(valid_until);

    if (isNaN(validFromDate.getTime()) || isNaN(validUntilDate.getTime())) {
      throw new HTTPException(400, { message: 'Invalid date format for valid_from or valid_until' });
    }

    // Ensure valid_until is after valid_from
    if (validUntilDate <= validFromDate) {
      throw new HTTPException(400, { message: 'valid_until must be after valid_from' });
    }

    // Determine redemption_item_status based on is_active and dates
    let redemption_item_status: 'active' | 'expired' | 'suspended' | 'scheduled' = 'suspended';

    if (is_active) {
      const currentDate = new Date();

      if (currentDate < validFromDate) {
        redemption_item_status = 'scheduled';
      } else if (currentDate >= validFromDate && currentDate <= validUntilDate) {
        redemption_item_status = 'active';
      } else if (currentDate > validUntilDate) {
        redemption_item_status = 'expired';
      }
    }

    // Prepare values common to both discount types
    const redemptionItemName = redemption_item_name.trim();
    const minSpending = parseFloat(minimum_spending.toFixed(2)); // Ensure two decimal places

    // Initialize variables for fields that may or may not be present
    let discountAmount: number | null = null;
    let fixedDiscountCap: number | null = null;

    // Validate and assign fields based on redemption_type
    if (redemption_type === 'fixed_amount') {
      if (typeof discount_amount !== 'number') {
        throw new HTTPException(400, {
          message: 'Invalid or missing discount_amount for fixed_amount discount type',
        });
      }
      discountAmount = parseFloat(discount_amount.toFixed(2)); // Ensure two decimal places
      fixedDiscountCap = null; // Not applicable for fixed_amount
    } else if (redemption_type === 'percentage') {
      if (
        typeof discount_percentage !== 'number' ||
        typeof fixed_discount_cap !== 'number'
      ) {
        throw new HTTPException(400, {
          message: 'Invalid or missing discount_percentage or fixed_discount_cap for percentage discount type',
        });
      }
      discountAmount = parseFloat(discount_percentage.toFixed(2)); // Store as discount_amount in database
      fixedDiscountCap = parseFloat(fixed_discount_cap.toFixed(2));
    }

    // Optional fields: redemption_content and redemption_term
    const redemptionContent = redemption_content && typeof redemption_content === 'string' ? redemption_content : null;
    const redemptionTerm = redemption_term && typeof redemption_term === 'string' ? redemption_term : null;

    const insertQuery = `
      INSERT INTO redemption_item (
        redemption_item_name,
        redemption_type,
        discount_amount,
        quantity_available,
        minimum_spending,
        fixed_discount_cap,
        validity_period,
        valid_from,
        valid_until,
        redeem_point,
        redemption_item_status,
        redemption_content,
        redemption_term
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING redemption_item_id
    `;

    const values = [
      redemptionItemName,
      redemption_type,
      discountAmount,
      quantity_available,
      minSpending,
      fixedDiscountCap,
      validity_period, // Use validity_period as provided
      validFromDate,
      validUntilDate,
      redeem_point,
      redemption_item_status,
      redemptionContent,
      redemptionTerm,
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
          redemption_item_id: result.rows[0].redemption_item_id,
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