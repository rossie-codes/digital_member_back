// src/controllers/discount_code/put_discount_code_is_active.ts

import { pool } from '../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import putShopifyDiscountCodeIsActive from '../../shopify/put_shopify_discount_code_is_active';

async function putDiscountCodeIsActive(c: Context): Promise<Response> {
  try {
    console.log('putDiscountCodeIsActive function begin');

    const discount_code_id_str = c.req.param('discount_code_id');
    const discount_code_id = parseInt(discount_code_id_str, 10);
    if (isNaN(discount_code_id)) {
      throw new HTTPException(400, { message: 'Invalid discount code ID' });
    }

    const body = await c.req.json();

    console.log('Received body:', body);
    console.log('Discount code ID:', discount_code_id);

    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      throw new HTTPException(400, { message: 'Invalid input: is_active must be a boolean' });
    }

    console.log('Validated is_active:', is_active);

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const selectQuery = `
        SELECT webstore_discount_code_id, valid_from, valid_until
        FROM discount_code
        WHERE discount_code_id = $1
      `;
      const selectResult = await client.query(selectQuery, [discount_code_id]);

      if (selectResult.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'Discount code not found' });
      }

      const {
        webstore_discount_code_id,
        valid_from,
        valid_until,
      } = selectResult.rows[0];

      if (!webstore_discount_code_id) {
        await client.query('ROLLBACK');
        throw new HTTPException(400, { message: 'No Shopify discount code ID associated with this discount code' });
      }

      try {
        let updatedDiscount;
        if (is_active) {
          // Reactivate the discount code with original validity dates
          updatedDiscount = await putShopifyDiscountCodeIsActive(
            webstore_discount_code_id,
            is_active,
            valid_from.toISOString(),
            valid_until.toISOString(),
          );
        } else {
          // Deactivate the discount code
          updatedDiscount = await putShopifyDiscountCodeIsActive(
            webstore_discount_code_id,
            is_active,
          );
        }
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating discount code status in Shopify:', error);
        throw new HTTPException(500, { message: 'Failed to update discount code status in Shopify' });
      }

      const updateQuery = `
        UPDATE discount_code
        SET is_active = $1, updated_at = NOW()
        WHERE discount_code_id = $2
        RETURNING discount_code_id
      `;
      const values = [is_active, discount_code_id];

      const result = await client.query(updateQuery, values);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'Discount code not found on update' });
      }

      await client.query('COMMIT');

      console.log(`Successfully updated discount_code_id: ${discount_code_id} to is_active: ${is_active}`);

      return c.json(
        { message: 'Discount code status updated successfully', discount_code_id },
        200
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating discount code status:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
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