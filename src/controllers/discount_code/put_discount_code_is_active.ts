// src/controllers/discount_code/put_discount_code_is_active.ts

import { pool } from '../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import putShopifyDiscountCodeIsActive from '../../shopify/put_shopify_discount_code_is_active';

async function putDiscountCodeIsActive(c: Context): Promise<Response> {
  try {

    console.log('putDiscountCodeIsActive function begin')


    // Extract discount_code_id from the route parameters
    const discount_code_id_str = c.req.param('discount_code_id');
    const discount_code_id = parseInt(discount_code_id_str, 10);
    if (isNaN(discount_code_id)) {
      throw new HTTPException(400, { message: 'Invalid discount code ID' });
    }

    // Parse the request body to get action
    const body = await c.req.json();
    const { action } = body;

    // Validate action
    if (action !== 'enable' && action !== 'suspended') {
      throw new HTTPException(400, { message: 'Invalid action. Must be "enable" or "suspended".' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Fetch necessary details from the database
      const selectQuery = `
        SELECT webstore_discount_code_id, valid_from, valid_until
        FROM discount_code
        WHERE discount_code_id = $1
      `;
      const selectResult = await client.query(selectQuery, [discount_code_id]);

      if (selectResult.rowCount === 0) {
        throw new HTTPException(404, { message: 'Discount code not found' });
      }

      const {
        webstore_discount_code_id,
        valid_from: validFromString,
        valid_until: validUntilString,
      } = selectResult.rows[0];

      if (!webstore_discount_code_id) {
        throw new HTTPException(400, {
          message: 'No Shopify discount code ID associated with this discount code',
        });
      }

      // Convert valid_from and valid_until to Date objects
      const valid_from = validFromString ? new Date(validFromString) : null;
      const valid_until = validUntilString ? new Date(validUntilString) : null;

      if (!valid_from || !valid_until) {
        throw new HTTPException(400, {
          message: 'Valid from and valid until dates are required',
        });
      }

      let newStatus = 'suspended';

      if (action === 'enable') {
        const currentDate = new Date();

        if (currentDate < valid_from) {
          newStatus = 'scheduled';
        } else if (currentDate >= valid_from && currentDate <= valid_until) {
          newStatus = 'active';
        } else if (currentDate > valid_until) {
          newStatus = 'expired';
        }

        try {
          // Activate the discount code in Shopify
          await putShopifyDiscountCodeIsActive(
            webstore_discount_code_id,
            true,
            valid_from.toISOString(),
            valid_until.toISOString()
          );
        } catch (error) {
          console.error('Error updating discount code status in Shopify:', error);
          throw new HTTPException(500, {
            message: 'Failed to update discount code status in Shopify',
          });
        }
      } else if (action === 'suspended') {
        newStatus = 'suspended';

        try {
          // Deactivate the discount code in Shopify
          await putShopifyDiscountCodeIsActive(webstore_discount_code_id, false);
        } catch (error) {
          console.error('Error updating discount code status in Shopify:', error);
          throw new HTTPException(500, {
            message: 'Failed to update discount code status in Shopify',
          });
        }
      }

      // Update the discount_code_status in the database
      const updateQuery = `
        UPDATE discount_code
        SET discount_code_status = $1, updated_at = NOW()
        WHERE discount_code_id = $2
        RETURNING discount_code_id
      `;
      const values = [newStatus, discount_code_id];

      const result = await client.query(updateQuery, values);

      if (result.rowCount === 0) {
        throw new HTTPException(404, { message: 'Discount code not found on update' });
      }

      await client.query('COMMIT');

      // Return success response
      return c.json(
        { message: 'Discount code status updated successfully', discount_code_id },
        200
      );
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error updating discount code status:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error in putDiscountCodeIsActive:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default putDiscountCodeIsActive;