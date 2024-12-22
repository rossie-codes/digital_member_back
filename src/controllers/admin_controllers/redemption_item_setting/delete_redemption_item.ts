// src/controllers/redemption_item_setting/delete_redemption_item.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function deleteRedemptionItem(c: Context): Promise<Response> {
  try {
    // Get redemption_item_id from route parameters
    const redemption_item_id_str = c.req.param('redemption_item_id');
    const redemption_item_id = parseInt(redemption_item_id_str, 10);
    if (isNaN(redemption_item_id)) {
      throw new HTTPException(400, { message: 'Invalid redemption item ID' });
    }

    // No need to parse the request body as we only need the item_id

    // const client = await pool.connect();

    const tenant = c.get("tenant_host");
    console.log("tenant", tenant);
    const client = await getTenantClient(tenant);
  

    try {
      await client.query('BEGIN');

      // Update the redemption item's deleted_status to TRUE
      const updateQuery = `
        UPDATE redemption_item
        SET deleted_status = TRUE, updated_at = NOW()
        WHERE redemption_item_id = $1
        RETURNING redemption_item_id
      `;
      const values = [redemption_item_id];

      const result = await client.query(updateQuery, values);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'Redemption item not found' });
      }

      await client.query('COMMIT');

      return c.json(
        { message: 'Redemption item deleted successfully', redemption_item_id },
        200 // Consider using 204 (No Content) if you don't need to return data
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting redemption item:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in deleteRedemptionItem:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default deleteRedemptionItem;