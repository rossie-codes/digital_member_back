// src/controllers/member/get_birthday_member_ids.ts

import { pool } from '../../db';
import type { Context } from 'hono';

interface Member {
  member_id: number;
}

async function getBirthdayMemberIds(c: Context): Promise<{
  member_ids: Member[];
}> {
  try {
    // Get the current month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;

    // Query to get member IDs with birthdays in the current month
    const query = `
      SELECT member_id
      FROM member
      WHERE EXTRACT(MONTH FROM birthday) = $1
    `;
    const values = [currentMonth];

    const result = await pool.query(query, values);

    const members: Member[] = result.rows.map((row) => ({
      member_id: row.member_id,
    }));

    return {
      member_ids: members,
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed');
  }
}

export default getBirthdayMemberIds;