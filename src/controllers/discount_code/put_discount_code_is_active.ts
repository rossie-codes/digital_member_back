// src/controllers/discount_code/put_discount_code_is_active.ts

import { pool } from '../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function putDiscountCodeIsActive(c: Context): Promise<Response> {
  try {
    // Log the beginning of the function
    console.log('putDiscountCodeIsActive function begin');

    // Extract discount_code_id from route parameters
    const discount_code_id_str = c.req.param('discount_code_id');
    const discount_code_id = parseInt(discount_code_id_str, 10);
    if (isNaN(discount_code_id)) {
      throw new HTTPException(400, { message: 'Invalid discount code ID' });
    }

    // Parse the request body to get is_active
    const body = await c.req.json();

    console.log('putDiscountCodeIsActive function check body:', body);
    console.log('putDiscountCodeIsActive function check discount_code_id:', discount_code_id);

    // Extract is_active from the body
    const { is_active } = body;

    // Validate is_active
    if (typeof is_active !== 'boolean') {
      throw new HTTPException(400, { message: 'Invalid input: is_active must be a boolean' });
    }

    // Log the validated is_active value
    console.log('Validated is_active:', is_active);

    // Get a database client from the pool
    const client = await pool.connect();

    try {
      // Start a transaction
      await client.query('BEGIN');

      // Update the discount code's is_active status
      const updateQuery = `
        UPDATE discount_code
        SET is_active = $1, updated_at = NOW()
        WHERE discount_code_id = $2
        RETURNING discount_code_id
      `;
      const values = [is_active, discount_code_id];

      const result = await client.query(updateQuery, values);

      if (result.rowCount === 0) {
        // Discount code not found
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'Discount code not found' });
      }

      // Commit the transaction
      await client.query('COMMIT');

      // Log the successful update
      console.log(`Successfully updated discount_code_id: ${discount_code_id} to is_active: ${is_active}`);

      // Return success response
      return c.json(
        { message: 'Discount code status updated successfully', discount_code_id },
        200
      );
    } catch (error) {
      // Roll back the transaction in case of error
      await client.query('ROLLBACK');
      console.error('Error updating discount code status:', error);
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