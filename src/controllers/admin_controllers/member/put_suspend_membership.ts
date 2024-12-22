// src/controllers/member/put_suspend_membership.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function putSuspendMembership(c: Context): Promise<Response> {
  console.log('putSuspendMembership function begin');

  const tenant = c.get("tenant_host");
  // const tenant = 'https://mm9_client'
  // const tenant = 'https://membi-admin'

  console.log("tenant", tenant);

  const pool = await getTenantClient(tenant);

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
    const { membership_status } = body;

    if (typeof membership_status !== 'string') {
      throw new HTTPException(400, { message: 'Invalid membership_status value' });
    }
    console.log('Received membership_status value:', membership_status);

    // Update the membership_status field in the member table
    const updateQuery = `
      UPDATE member
      SET membership_status = $1
      WHERE member_phone = $2
    `;
    const result = await pool.query(updateQuery, [membership_status, memberPhone]);

    if (result.rowCount === 0) {
      throw new HTTPException(404, { message: 'Member not found' });
    }

    console.log('Membership updated for member_phone:', memberPhone, 'membership_status set to:', membership_status);
    return c.json({ message: 'Membership updated successfully' }, 200);
  } catch (error) {
    console.error('Error in putSuspendMembership:', error);
    if (error instanceof HTTPException) {
      throw error;
    } else {
      throw new HTTPException(500, { message: 'Internal Server Error' });
    }
  } finally {
    pool.release();
  }
}

export default putSuspendMembership;