// src/controllers/discount_code/post_new_discount_code.ts

import { pool } from '../../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import postShopifyNewDiscountCode from '../../../shopify/post_shopify_new_discount_code';

interface DiscountInput {
  discount_code_name: string;
  discount_code: string;
  discount_type: 'fixed_amount' | 'percentage';
  discount_amount?: number;
  discount_percentage?: number;
  minimum_spending: number;
  fixed_discount_cap?: number;
  use_limit_type: 'single_use' | 'once_per_customer' | 'unlimited';
  valid_from: string;
  valid_until: string;
}

async function postNewDiscountCode(c: Context): Promise<Response> {
  try {
    // Parse the request body
    const body = await c.req.json();

    // Extract common data
    const {
      discount_code_name,
      discount_code,
      discount_type,
      minimum_spending,
      use_limit_type,
      valid_from,
      valid_until,
      is_active,
      discount_amount,
      discount_percentage,
      fixed_discount_cap,
      discount_code_content,
      discount_code_term,
    } = body;

    // Validate common required fields
    if (
      typeof discount_code_name !== 'string' ||
      !discount_code_name.trim() ||
      typeof discount_code !== 'string' ||
      !discount_code.trim() ||
      !['fixed_amount', 'percentage'].includes(discount_type) ||
      typeof minimum_spending !== 'number' ||
      minimum_spending < 0 ||
      !['single_use', 'once_per_customer', 'unlimited'].includes(use_limit_type) ||
      typeof valid_from !== 'string' ||
      typeof valid_until !== 'string' ||
      typeof is_active !== 'boolean'
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

    // Determine discount_code_status based on is_active and dates
    let discount_code_status: 'active' | 'expired' | 'suspended' | 'scheduled' = 'suspended';

    if (is_active) {
      const currentDate = new Date();

      if (currentDate < validFromDate) {
        discount_code_status = 'scheduled';
      } else if (currentDate >= validFromDate && currentDate <= validUntilDate) {
        discount_code_status = 'active';
      } else if (currentDate > validUntilDate) {
        discount_code_status = 'expired';
      }
    }

    // Initialize variables
    let discountAmount: number | undefined;
    let discountPercentage: number | undefined;
    let fixedDiscountCap: number | undefined;

    // Handle discount types
    if (discount_type === 'fixed_amount') {
      if (typeof discount_amount !== 'number' || discount_amount <= 0) {
        throw new HTTPException(400, {
          message: 'Invalid or missing discount_amount for fixed_amount discount type',
        });
      }
      discountAmount = parseFloat(discount_amount.toFixed(2));
    } else if (discount_type === 'percentage') {
      if (
        typeof discount_percentage !== 'number' ||
        discount_percentage <= 0 ||
        discount_percentage >= 100
      ) {
        throw new HTTPException(400, {
          message: 'Invalid or missing discount_percentage for percentage discount type',
        });
      }
      discountPercentage = parseFloat(discount_percentage.toFixed(2));

      if (fixed_discount_cap !== undefined && fixed_discount_cap !== null) {
        if (typeof fixed_discount_cap !== 'number' || fixed_discount_cap <= 0) {
          throw new HTTPException(400, {
            message: 'Invalid fixed_discount_cap for percentage discount type',
          });
        }
        fixedDiscountCap = parseFloat(fixed_discount_cap.toFixed(2));
      }
    }

    // Use use_limit_type directly
    const useLimitType = use_limit_type; // Since use_limit_type matches ENUM values

    // Prepare discount input for Shopify
    const discountInput: DiscountInput = {
      discount_code_name,
      discount_code,
      discount_type,
      minimum_spending,
      use_limit_type: useLimitType,
      valid_from,
      valid_until,
      ...(discountAmount !== undefined && { discount_amount: discountAmount }),
      ...(discountPercentage !== undefined && { discount_percentage: discountPercentage }),
      ...(fixedDiscountCap !== undefined && { fixed_discount_cap: fixedDiscountCap }),
    };

    // Create discount code in Shopify
    const shopifyDiscount = await postShopifyNewDiscountCode(discountInput);

    const shopifyId = shopifyDiscount.id;
    console.log('Shopify discount code ID:', shopifyId);

    // Decode Shopify ID (if necessary)
    function decodeShopifyId(globalId: string): string {
      const base64Decoded = Buffer.from(globalId, 'base64').toString('utf8');
      const match = base64Decoded.match(/gid:\/\/shopify\/DiscountCodeNode\/(\d+)/);
      return match ? match[1] : globalId;
    }

    const shopify_discount_code_id = decodeShopifyId(shopifyId);

    const discount_amount_to_db = discountAmount || discountPercentage;
    // Save to database if Shopify creation is successful
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO discount_code (
          webstore_discount_code_id,
          discount_code_name,
          discount_code,
          discount_type,
          discount_amount,
          minimum_spending,
          fixed_discount_cap,
          use_limit_type,
          valid_from,
          valid_until,
          discount_code_status,
          discount_code_content,
          discount_code_term
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        ) RETURNING discount_code_id
      `;

      const values = [
        shopify_discount_code_id,
        discount_code_name.trim(),
        discount_code.trim(),
        discount_type,
        discount_amount_to_db,
        minimum_spending,
        fixedDiscountCap,
        useLimitType,
        validFromDate,
        validUntilDate,
        discount_code_status,
        discount_code_content,
        discount_code_term,
      ];

      const result = await client.query(insertQuery, values);

      await client.query('COMMIT');

      return c.json(
        {
          message: 'Discount code added successfully',
          discount_code_id: result.rows[0].discount_code_id,
          shopify_discount_id: shopifyDiscount.id,
        },
        200
      );
    } catch (error: any) {
      await client.query('ROLLBACK');

      if (error.code === '23505' && error.constraint === 'discount_code_discount_code_key') {
        throw new HTTPException(409, { message: 'Discount code already exists' });
      }

      console.error('Error inserting discount code:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in postNewDiscountCode:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default postNewDiscountCode;