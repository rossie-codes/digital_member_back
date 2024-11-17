// src/controllers/member/put_reactivate_membership.ts

import { pool } from '../db';
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function putReactivateMembership(c: Context): Promise<Response> {
  console.log('putReactivateMembership function begin');
  try {
    // Extract memberPhone from the route parameters
    const memberPhone = c.req.param('memberPhone');
    if (!memberPhone) {
      throw new HTTPException(400, { message: 'Member phone is required' });
    }
    console.log('Received request to reactivate membership for memberPhone:', memberPhone);

    // Fetch the member's membership expiry date
    const memberQuery = `
      SELECT membership_expiry_date
      FROM member
      WHERE member_phone = $1
    `;
    const memberResult = await pool.query(memberQuery, [memberPhone]);

    if (memberResult.rows.length === 0) {
      throw new HTTPException(404, { message: 'Member not found' });
    }

    const { membership_expiry_date } = memberResult.rows[0];

    if (!membership_expiry_date) {
      throw new HTTPException(400, { message: 'Membership expiry date is not set for this member' });
    }

    console.log('Membership expiry date:', membership_expiry_date);

    // Check if the current date is before or on the expiry date
    const currentDate = new Date();
    const expiryDate = new Date(membership_expiry_date);

    let membershipStatus: "expired" | "active" | "suspended";

    if (currentDate <= expiryDate) {
      // Membership is active
      membershipStatus = 'active';
    } else {
      // Membership has expired
      membershipStatus = 'expired';
    }

    console.log('Calculated membership_status value:', membershipStatus);

    // Update the membership_status field in the member table
    const updateQuery = `
      UPDATE member
      SET membership_status = $1
      WHERE member_phone = $2
    `;
    const result = await pool.query(updateQuery, [membershipStatus, memberPhone]);

    if (result.rowCount === 0) {
      throw new HTTPException(404, { message: 'Member not found' });
    }

    console.log('Membership updated for memberPhone:', memberPhone, 'membership_status set to:', membershipStatus);
    return c.json({ message: 'Membership reactivated successfully', membership_status: membershipStatus }, 200);
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