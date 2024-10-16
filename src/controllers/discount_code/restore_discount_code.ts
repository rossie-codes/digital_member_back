// src/controllers/discount_code/restore_discount_code.ts

import { pool } from '../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function restoreDiscountCode(c: Context): Promise<Response> {
  try {
    // Get discount_code_id from route parameters
    const discount_code_id_str = c.req.param('discount_code_id');
    const discount_code_id = parseInt(discount_code_id_str, 10);
    if (isNaN(discount_code_id)) {
      throw new HTTPException(400, { message: 'Invalid discount code ID' });
    }

    // No need to parse the request body as we only need the item_id

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update the redemption item's deleted_status to TRUE
      const updateQuery = `
        UPDATE discount_code
        SET deleted_status = FALSE, updated_at = NOW()
        WHERE discount_code_id = $1
        RETURNING discount_code_id
      `;
      const values = [discount_code_id];

      const result = await client.query(updateQuery, values);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'Redemption item not found' });
      }

      await client.query('COMMIT');

      return c.json(
        { message: 'Redemption item deleted successfully', discount_code_id },
        200 // Consider using 204 (No Content) if you don't need to return data
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting restoreDiscountCode item:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in restoreDiscountCode:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default restoreDiscountCode;