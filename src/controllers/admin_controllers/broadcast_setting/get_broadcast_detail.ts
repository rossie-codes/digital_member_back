// src/controllers/broadcast_setting/get_broadcast_detail.ts

import { pool } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface GetBroadcastDetailResponse {
  broadcast_name: string;
  wati_template: string;
  broadcast_now: boolean;
  scheduled_start: string | null;
  member_ids: number[];
}

async function getBroadcastDetail(c: Context): Promise<GetBroadcastDetailResponse> {
  
  console.log('getBroadcastDetail function begin');

  const broadcast_id = c.req.param('broadcast_id');
  console.log('broadcast_id is: ', broadcast_id);

  if (!broadcast_id) {
    throw new Error('broadcast_id parameter is required');
  }

  try {
    // Fetch broadcast details
    const broadcastQuery = `
      SELECT
        broadcast_name,
        wati_template,
        broadcast_now,
        scheduled_start
      FROM broadcast
      WHERE broadcast_id = $1
    `;
    const broadcastResult = await pool.query(broadcastQuery, [broadcast_id]);

    if (broadcastResult.rowCount === 0) {
      throw new Error(`Broadcast with id ${broadcast_id} not found`);
    }

    const { broadcast_name, wati_template, broadcast_now, scheduled_start } = broadcastResult.rows[0];

    // Fetch member_ids from broadcast_history
    const memberQuery = `
      SELECT member_id
      FROM broadcast_history
      WHERE broadcast_id = $1
    `;
    const memberResult = await pool.query(memberQuery, [broadcast_id]);

    const member_ids = memberResult.rows.map(row => row.member_id);

    return {
      broadcast_name,
      wati_template,
      broadcast_now,
      scheduled_start,
      member_ids,
    };
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  }
}

export default getBroadcastDetail;