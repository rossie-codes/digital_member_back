// src/controllers/redemption_item_setting/put_redemption_item_status.ts

import { pool } from '../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function putRedemptionItemIsActive(c: Context): Promise<Response> {
  try {
    // Get redemption_item_id from route parameters
    console.log('putRedemptionItemIsActive function begin')

    const redemption_item_id_str = c.req.param('redemption_item_id');
    const redemption_item_id = parseInt(redemption_item_id_str, 10);
    if (isNaN(redemption_item_id)) {
      throw new HTTPException(400, { message: 'Invalid redemption item ID' });
    }

    // Parse the request body to get is_active
    const body = await c.req.json();

    console.log('putRedemptionItemIsActive fucntion check body: ', body)
    console.log('putRedemptionItemIsActive fucntion check id: ', redemption_item_id)
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      throw new HTTPException(400, { message: 'Invalid input: is_active must be a boolean' });
    }

    // Map is_active to status
    // const is_active = is_active ? 'true' : 'false';

    // Get a database client from the pool
    const client = await pool.connect();

    try {
      // Start a transaction
      await client.query('BEGIN');

      // Update the redemption item status
      const updateQuery = `
        UPDATE redemption_item
        SET is_active = $1, updated_at = NOW()
        WHERE redemption_item_id = $2
        RETURNING redemption_item_id
      `;
      const values = [is_active, redemption_item_id];

      const result = await client.query(updateQuery, values);

      if (result.rowCount === 0) {
        // Redemption item not found
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'Redemption item not found' });
      }

      // Commit the transaction
      await client.query('COMMIT');

      // Return success response
      return c.json(
        { message: 'Redemption item status updated successfully', redemption_item_id },
        200
      );
    } catch (error) {
      // Roll back the transaction in case of error
      await client.query('ROLLBACK');
      console.error('Error updating redemption item status:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error in putRedemptionItemIsActive:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default putRedemptionItemIsActive;