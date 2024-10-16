// src/controllers/discount_code/delete_discount_code.ts

import { pool } from '../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function deleteDiscountCode(c: Context): Promise<Response> {
  try {
    // Get redemption_item_id from route parameters
    const discount_code_id_str = c.req.param('discount_code_id');
    const discount_code_id = parseInt(discount_code_id_str, 10);
    if (isNaN(discount_code_id)) {
      throw new HTTPException(400, { message: 'Invalid redemption item ID' });
    }

    // No need to parse the request body as we only need the item_id

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update the redemption item's deleted_status to TRUE
      const updateQuery = `
        UPDATE discount_code
        SET deleted_status = TRUE, updated_at = NOW()
        WHERE discount_code_id = $1
        RETURNING discount_code_id
      `;
      const values = [discount_code_id];

      const result = await client.query(updateQuery, values);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'discount_code_id not found' });
      }

      await client.query('COMMIT');

      return c.json(
        { message: 'discount_code_id deleted successfully', discount_code_id },
        200 // Consider using 204 (No Content) if you don't need to return data
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting discount_code_id:', error);
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