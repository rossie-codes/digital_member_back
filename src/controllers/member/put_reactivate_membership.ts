// src/controllers/member/put_suspend_membership.ts

import { pool } from '../db';
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function putReactivateMembership(c: Context): Promise<Response> {
  console.log('putReactivateMembership function begin');
  try {
    // Extract member_phone from the route parameters
    const memberPhone = c.req.param('memberPhone');

    console.log('member_phone is ', memberPhone);


    if (!memberPhone) {
      throw new HTTPException(400, { message: 'Member phone is required' });
    }
    console.log('Received request to update membership for member_phone:', memberPhone);

    // Parse the request body
    const body = await c.req.json();
    const { is_active } = body;

    if (typeof is_active !== 'number') {
      throw new HTTPException(400, { message: 'Invalid is_active value' });
    }
    console.log('Received is_active value:', is_active);

    // Update the is_active field in the member table
    const updateQuery = `
      UPDATE member
      SET is_active = $1
      WHERE member_phone = $2
    `;
    const result = await pool.query(updateQuery, [is_active, memberPhone]);

    if (result.rowCount === 0) {
      throw new HTTPException(404, { message: 'Member not found' });
    }

    console.log('Membership updated for member_phone:', memberPhone, 'is_active set to:', is_active);
    return c.json({ message: 'Membership updated successfully' }, 200);
  } catch (error) {
    console.error('Error in putReactivateMembership:', error);
    if (error instanceof HTTPException) {
      throw error;
    } else {
      throw new HTTPException(500, { message: 'Internal Server Error' });
    }
  }
}

export default putReactivateMembership;