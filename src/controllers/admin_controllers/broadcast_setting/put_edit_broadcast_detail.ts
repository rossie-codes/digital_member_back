// src/controllers/broadcast_setting/put_edit_broadcast_detail.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

interface EditBroadcast {
  broadcast_id: number;
  broadcast_name: string;
  wati_template: string;
  discount_code?: string;
  schedule_type: 'now' | 'later';
  scheduled_time?: string;
  member_ids: string[];
}

async function putEditBroadcastDetail(c: Context): Promise<Response> {
  console.log('putEditBroadcast function begin');
  try {
    const body = await c.req.json<EditBroadcast>();
    const broadcast_id = c.req.param("broadcast_id");
    const {
      broadcast_name,
      wati_template,
      discount_code = null,
      schedule_type,
      scheduled_time,
      member_ids,
    } = body;

    if (
      // !broadcast_id ||
      !broadcast_name ||
      !wati_template ||
      !schedule_type ||
      !member_ids
    ) {
      throw new HTTPException(400, { message: 'Missing required fields' });
    }

    if (!Array.isArray(member_ids) || member_ids.length === 0) {
      throw new HTTPException(400, {
        message: 'member_ids must be a non-empty array',
      });
    }


    console.log('broadcast_id:', broadcast_id);
    console.log('broadcast_name:', broadcast_name);
    console.log('wati_template:', wati_template);
    console .log('body:', body);
    let broadcast_now = false;
    let scheduled_start: string | null = null;

    if (schedule_type === 'now') {
      broadcast_now = true;
      scheduled_start = new Date().toISOString(); // Set scheduled_start to now()
    } else if (schedule_type === 'later') {
      if (!scheduled_time) {
        throw new HTTPException(400, {
          message: 'scheduled_time is required when schedule_type is "later"',
        });
      }
      scheduled_start = scheduled_time;
    } else {
      throw new HTTPException(400, { message: 'Invalid schedule_type' });
    }

    // const client = await pool.connect();

    const tenant = c.get("tenant_host");
    console.log("tenant", tenant);
    const client = await getTenantClient(tenant);
  

    try {
      await client.query('BEGIN');

      // Update the broadcast info
      const updateBroadcastQuery = `
        UPDATE broadcast
        SET
          broadcast_name = $1,
          discount_code = $2,
          wati_template = $3,
          broadcast_now = $4,
          scheduled_start = $5,
          create_at = NOW()
        WHERE broadcast_id = $6
      `;
      const updateValues = [
        broadcast_name,
        discount_code,
        wati_template,
        broadcast_now,
        scheduled_start,
        broadcast_id,
      ];

      const updateResult = await client.query(updateBroadcastQuery, updateValues);

      if (updateResult.rowCount === 0) {
        throw new HTTPException(404, { message: 'Broadcast not found' });
      }

      // Update existing broadcast_history entries to 'edited'
      const updateHistoryQuery = `
        UPDATE broadcast_history
        SET
          broadcast_history_status = 'edited',
          updated_at = NOW()
        WHERE broadcast_id = $1
          AND broadcast_history_status = 'pending'
      `;
      await client.query(updateHistoryQuery, [broadcast_id]);

      // Insert new broadcast_history entries with new member_ids and status 'pending'
      const memberInsertQuery = `
        INSERT INTO broadcast_history (broadcast_id, member_id, broadcast_history_status, updated_at)
        VALUES
          ${member_ids
            .map((_, i) => `($1, $${i + 2}, 'pending', NOW())`)
            .join(', ')}
      `;
      const memberValues = [broadcast_id, ...member_ids.map(Number)];

      await client.query(memberInsertQuery, memberValues);

      await client.query('COMMIT');

      return c.json(
        { message: 'Broadcast updated successfully', broadcast_id },
        200
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating broadcast:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in putEditBroadcast:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default putEditBroadcastDetail;