// src/controllers/discount_code/delete_discount_code.ts

import { pool } from '../../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import putShopifyDiscountCodeIsActive from '../../../shopify/put_shopify_discount_code_is_active';

async function deleteDiscountCode(c: Context): Promise<Response> {
  try {
    // Get discount_code_id from route parameters
    const discount_code_id_str = c.req.param('discount_code_id');
    const discount_code_id = parseInt(discount_code_id_str, 10);
    if (isNaN(discount_code_id)) {
      throw new HTTPException(400, { message: 'Invalid discount code ID' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Fetch webstore_discount_code_id
      const selectQuery = `
        SELECT webstore_discount_code_id
        FROM discount_code
        WHERE discount_code_id = $1
      `;
      const selectResult = await client.query(selectQuery, [discount_code_id]);

      if (selectResult.rowCount === 0) {
        throw new HTTPException(404, { message: 'Discount code not found' });
      }

      const { webstore_discount_code_id } = selectResult.rows[0];

      if (!webstore_discount_code_id) {
        throw new HTTPException(400, { message: 'No associated Shopify discount code ID' });
      }

      // Deactivate the discount code in Shopify
      try {
        await putShopifyDiscountCodeIsActive(webstore_discount_code_id, false);
      } catch (error) {
        console.error('Error updating discount code status in Shopify:', error);
        throw new HTTPException(500, {
          message: 'Failed to update discount code status in Shopify',
        });
      }

      // Update the discount code's discount_code_status to 'suspended' and deleted_status to TRUE
      const updateQuery = `
        UPDATE discount_code
        SET discount_code_status = $1, deleted_status = TRUE, updated_at = NOW()
        WHERE discount_code_id = $2
        RETURNING discount_code_id
      `;
      const values = ['suspended', discount_code_id];

      const result = await client.query(updateQuery, values);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'Discount code not found' });
      }

      await client.query('COMMIT');

      return c.json(
        { message: 'Discount code deleted successfully', discount_code_id },
        200 // Use 204 (No Content) if you don't need to return data
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting discount code:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in deleteDiscountCode:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default deleteDiscountCode;