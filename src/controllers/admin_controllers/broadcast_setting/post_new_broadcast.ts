// src/controllers/broadcast_setting/post_new_broadcast.ts

import { pool } from '../../db';
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

interface NewBroadcast {
  broadcast_name: string;
  wati_template: string;
  discount_code?: string;
  schedule_type: 'now' | 'later';
  scheduled_time?: string;
  member_ids: string[];
}

async function postNewBroadcast(c: Context): Promise<Response> {
  console.log('postNewBroadcast function begin');
  try {
    const body = await c.req.json<NewBroadcast>();
    const {
      broadcast_name,
      wati_template,
      discount_code,
      schedule_type,
      scheduled_time,
      member_ids,
    } = body;

    if (!broadcast_name || !wati_template || !schedule_type || !member_ids) {
      throw new HTTPException(400, { message: 'Missing required fields' });
    }

    if (!Array.isArray(member_ids) || member_ids.length === 0) {
      throw new HTTPException(400, { message: 'member_ids must be a non-empty array' });
    }

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

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO broadcast (
          broadcast_name,
          discount_code,
          wati_template,
          broadcast_now,
          scheduled_start,
          create_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING broadcast_id
      `;
      const values = [
        broadcast_name,
        discount_code,
        wati_template,
        broadcast_now,
        scheduled_start,
      ];

      const result = await client.query(insertQuery, values);
      const broadcast_id = result.rows[0].broadcast_id;

      const memberInsertQuery = `
        INSERT INTO broadcast_history (broadcast_id, member_id, broadcast_history_status)
        VALUES ${member_ids
          .map((_, i) => `($1, $${i + 2}, 'pending')`)
          .join(', ')}
      `;
      const memberValues = [broadcast_id, ...member_ids.map(Number)];

      await client.query(memberInsertQuery, memberValues);

      await client.query('COMMIT');

      return c.json(
        { message: 'Broadcast created successfully', broadcast_id },
        201
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error inserting new broadcast:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in postNewBroadcast:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default postNewBroadcast;