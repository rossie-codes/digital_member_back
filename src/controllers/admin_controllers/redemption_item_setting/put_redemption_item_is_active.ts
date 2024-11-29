// src/controllers/redemption_item_setting/put_redemption_item_is_active.ts


import { pool } from '../../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function putRedemptionItemIsActive(c: Context): Promise<Response> {
  try {
    console.log('putRedemptionItemIsActive function begin')

    // Get redemption_item_id from route parameters
    const redemption_item_id_str = c.req.param('redemption_item_id');
    const redemption_item_id = parseInt(redemption_item_id_str, 10);
    if (isNaN(redemption_item_id)) {
      throw new HTTPException(400, { message: 'Invalid redemption item ID' });
    }

    // Parse the request body to get is_active
    const body = await c.req.json();
    const { action } = body;

    if (action !== 'enable' && action !== 'suspended') {
      throw new HTTPException(400, { message: 'Invalid input: is_active must be a boolean' });
    }

    // Get a database client from the pool
    const client = await pool.connect();

    try {
      // Start a transaction
      await client.query('BEGIN');


      const selectQuery = `
      SELECT valid_from, valid_until
      FROM redemption_item
      WHERE redemption_item_id = $1
    `;
      const selectResult = await client.query(selectQuery, [redemption_item_id]);

      if (selectResult.rowCount === 0) {
        throw new HTTPException(404, { message: 'Discount code not found' });
      }

      const {
        valid_from: validFromString,
        valid_until: validUntilString,
      } = selectResult.rows[0];


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

      } else if (action === 'suspended') {
        newStatus = 'suspended';
        
      }

      
      // Update the redemption item status
      const updateQuery = `
        UPDATE redemption_item
        SET redemption_item_status = $1, updated_at = NOW()
        WHERE redemption_item_id = $2
        RETURNING redemption_item_id
      `;
      const values = [newStatus, redemption_item_id];

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