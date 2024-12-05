// src/controllers/member_controllers/member_auth/signup.ts

import type { Context } from 'hono';
import { pool } from '../../db';
import { HTTPException } from 'hono/http-exception';
import Bun from 'bun'; // Assuming Bun.js is available

interface SignupPayload {
  member_name?: string;
  member_birthday?: string;
  member_phone: string;
  referrer_phone?: string;
  member_password: string;
}

async function signupMember(c: Context) {
  try {
    console.log('Signup request received');
    const { member_name, member_birthday, member_phone, referrer_phone, member_password }: SignupPayload = await c.req.json();

    // Validate inputs
    if (!member_phone || !member_password) {
      throw new HTTPException(400, { message: 'Missing required fields' });
    }

    // Check if the member_phone already exists in member_login
    const checkLoginQuery = 'SELECT member_phone FROM member_login WHERE member_phone = $1';
    const checkLoginResult = await pool.query(checkLoginQuery, [member_phone]);

    if ((checkLoginResult.rowCount ?? 0) > 0) {
      console.log('Member login already exists');
      return c.json({ message: 'Member login already exists' }, 400);
    }

    let referrer_member_id: number | null = null;

    if (referrer_phone) {
      // Find referrer's member_id
      const referrerQuery = 'SELECT member_id FROM member WHERE member_phone = $1';
      const referrerResult = await pool.query(referrerQuery, [referrer_phone]);

      // Ensure rowCount is not null and greater than 0
      if (referrerResult.rowCount && referrerResult.rowCount > 0) {
        referrer_member_id = referrerResult.rows[0].member_id;
      } else {
        return c.json({ message: 'Referrer Number does not exist' }, 400);
      }
    }

    let member_id: number;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if member_phone exists in member table
      const checkMemberQuery = 'SELECT member_id FROM member WHERE member_phone = $1';
      const checkMemberResult = await client.query(checkMemberQuery, [member_phone]);

      if (checkMemberResult.rowCount && checkMemberResult.rowCount > 0) {
        // Member exists in member table
        console.log('Member exists in member table');
        member_id = checkMemberResult.rows[0].member_id;
      } else {
        // Member does not exist, create member record
        console.log('Creating new member record');
        const insertMemberQuery = `
          INSERT INTO member (member_phone, member_name, birthday, membership_status)
          VALUES ($1, $2, $3, 'active')
          RETURNING member_id
        `;
        const insertMemberValues = [member_phone, member_name || null, member_birthday || null];
        const memberResult = await client.query(insertMemberQuery, insertMemberValues);
        member_id = memberResult.rows[0].member_id;
      }

      // Hash the member_password
      const member_password_hash = await Bun.password.hash(member_password);

      // Insert into member_login
      const insertLoginQuery = `
        INSERT INTO member_login (member_id, member_phone, member_password_hash, failed_login_attempts)
        VALUES ($1, $2, $3, 0)
      `;
      await client.query(insertLoginQuery, [member_id, member_phone, member_password_hash]);

      // Handle referrer_phone if provided
      if (referrer_member_id) {
        // Update member's referrer_member_id
        const updateMemberQuery = `
          UPDATE member
          SET referrer_member_id = $1
          WHERE member_id = $2
        `;
        await client.query(updateMemberQuery, [referrer_member_id, member_id]);
      }

      await client.query('COMMIT');

      return c.json({ message: 'Signup successful' }, 201);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during signup:', error);
      return c.json({ message: 'Internal server error' }, 500);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    return c.json({ message: 'Internal server error' }, 500);
  }
}

export default signupMember;