// src/controllers/redemption_item_setting/put_redemption_item_detail.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function putRedemptionItemDetail(c: Context): Promise<Response> {
  try {
    // Get redemption_item_id from route parameters
    const redemption_item_id_str = c.req.param('redemption_item_id');
    const redemption_item_id = parseInt(redemption_item_id_str, 10);
    if (isNaN(redemption_item_id)) {
      throw new HTTPException(400, { message: 'Invalid redemption item ID' });
    }

    // Parse the request body
    const body = await c.req.json();

    // Extract the fields that can be edited
    const {
      redeem_point,
      valid_from,
      valid_until,
      redemption_content,
      redemption_term,
    } = body;

    // Validate the fields
    const updates: { [key: string]: any } = {};
    const errors: string[] = [];

    if (redeem_point !== undefined) {
      if (typeof redeem_point !== 'number' || redeem_point < 0) {
        errors.push('Invalid redeem_point');
      } else {
        updates.redeem_point = redeem_point;
      }
    }

    if (valid_from !== undefined) {
      const validFromDate = new Date(valid_from);
      if (isNaN(validFromDate.getTime())) {
        errors.push('Invalid valid_from date');
      } else {
        updates.valid_from = validFromDate;
      }
    }

    if (valid_until !== undefined) {
      const validUntilDate = new Date(valid_until);
      if (isNaN(validUntilDate.getTime())) {
        errors.push('Invalid valid_until date');
      } else {
        updates.valid_until = validUntilDate;
      }
    }

    // Check that valid_until is after valid_from if both are provided
    const validFromToCheck = updates.valid_from || (valid_from ? new Date(valid_from) : undefined);
    const validUntilToCheck = updates.valid_until || (valid_until ? new Date(valid_until) : undefined);

    if (validFromToCheck && validUntilToCheck) {
      if (validUntilToCheck <= validFromToCheck) {
        errors.push('valid_until must be after valid_from');
      }
    }

    if (redemption_content !== undefined) {
      if (typeof redemption_content !== 'string') {
        errors.push('Invalid redemption_content');
      } else {
        updates.redemption_content = redemption_content;
      }
    }

    if (redemption_term !== undefined) {
      if (typeof redemption_term !== 'string') {
        errors.push('Invalid redemption_term');
      } else {
        updates.redemption_term = redemption_term;
      }
    }

    if (errors.length > 0) {
      throw new HTTPException(400, { message: errors.join(', ') });
    }

    // If no fields to update
    if (Object.keys(updates).length === 0) {
      throw new HTTPException(400, { message: 'No valid fields to update' });
    }

    // Get a database client from the pool
    // const client = await pool.connect();

    const tenant = c.get("tenant_host");
    console.log("tenant", tenant);
    const client = await getTenantClient(tenant);
  

    try {
      // Start a transaction
      await client.query('BEGIN');

      // Fetch existing valid_from and valid_until from the database
      const selectQuery = `
        SELECT valid_from, valid_until
        FROM redemption_item
        WHERE redemption_item_id = $1
      `;
      const selectResult = await client.query(selectQuery, [redemption_item_id]);

      if (selectResult.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'Redemption item not found' });
      }

      const existingData = selectResult.rows[0];

      // Determine the valid_from and valid_until values to use
      const currentValidFrom = updates.valid_from || existingData.valid_from;
      const currentValidUntil = updates.valid_until || existingData.valid_until;

      // Recalculate redemption_item_status
      let redemption_item_status: 'active' | 'expired' | 'suspended' | 'scheduled' = 'suspended';

      const currentDate = new Date();

      if (currentValidFrom && currentValidUntil) {
        if (currentDate < currentValidFrom) {
          redemption_item_status = 'scheduled';
        } else if (currentDate >= currentValidFrom && currentDate <= currentValidUntil) {
          redemption_item_status = 'active';
        } else if (currentDate > currentValidUntil) {
          redemption_item_status = 'expired';
        }
      }

      // Include redemption_item_status in updates
      updates.redemption_item_status = redemption_item_status;

      // Build the dynamic SET clause
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      for (const key in updates) {
        setClauses.push(`${key} = $${idx}`);
        values.push(updates[key]);
        idx++;
      }

      // Add updated_at
      setClauses.push(`updated_at = NOW()`);

      // Add the redemption_item_id to the values
      values.push(redemption_item_id);

      // Prepare the SQL UPDATE statement
      const updateQuery = `
        UPDATE redemption_item
        SET ${setClauses.join(', ')}
        WHERE redemption_item_id = $${idx}
        RETURNING redemption_item_id
      `;

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
        {
          message: 'Redemption item updated successfully',
          redemption_item_id: redemption_item_id,
        },
        200
      );
    } catch (error) {
      // Roll back the transaction in case of error
      await client.query('ROLLBACK');
      console.error('Error updating redemption item:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error in putRedemptionItemDetail:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default putRedemptionItemDetail;