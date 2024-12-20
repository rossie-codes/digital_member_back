// src/controllers/admin_controllers/broadcast_setting/delete_broadcasat.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function deleteBroadcast(c: Context): Promise<Response> {
  try {
    // Get broadcast_id from route parameters
    const broadcast_id_str = c.req.param('broadcast_id');
    const broadcast_id = parseInt(broadcast_id_str, 10);
    if (isNaN(broadcast_id)) {
      throw new HTTPException(400, { message: 'Invalid Broadcast ID' });
    }

    // No need to parse the request body as we only need the item_id

    // const client = await pool.connect();


    const tenant = c.get("tenant");
    console.log("tenant", tenant);
    const client = await getTenantClient(tenant);

    try {
      await client.query('BEGIN');

      // Update the Broadcast's deleted_status to TRUE
      const updateQuery = `
        DELETE FROM public.broadcast
        WHERE broadcast_id = $1
      `;
      const values = [broadcast_id];

      const result = await client.query(updateQuery, values);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'Broadcast not found' });
      }

      await client.query('COMMIT');

      return c.json(
        { message: 'Broadcast deleted successfully', broadcast_id },
        200 // Consider using 204 (No Content) if you don't need to return data
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting Broadcast:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in deleteBroadcast:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default deleteBroadcast;