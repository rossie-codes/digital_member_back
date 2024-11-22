// src/controllers/member_controllers/member_auth/signup.ts

import type { Context } from 'hono';
import { pool } from '../../db';
import bcrypt from 'bcryptjs';
import { HTTPException } from 'hono/http-exception';


async function signupMember(c: Context) {
  try {
    console.log('Signup request received');
    const { member_phone, member_password, member_birthday, member_name, referrer_phone } = await c.req.json();

    // Validate inputs
    if (!member_phone || !member_password) {
      throw new HTTPException(400, { message: 'Missing required fields' });
    }

    // Check if the member_phone already exists
    const checkQuery = 'SELECT member_phone FROM member_login WHERE member_phone = $1';
    const checkResult = await pool.query(checkQuery, [member_phone]);

    if ((checkResult.rowCount ?? 0) > 0) {
      // Proceed knowing that rowCount is a number
      throw new HTTPException(500, { message: 'member login exist' });
    }

    // Hash the member_password
    const saltRounds = await bcrypt.genSalt(10);
    const member_password_hash = await bcrypt.hash(member_password, saltRounds);

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      console.log('Inserting member:', member_phone);

      // Create a new member entry
      const insertMemberQuery = `
        INSERT INTO member (member_phone, membership_status)
        VALUES ($1, 'active')
        RETURNING member_id
      `;
      const memberResult = await client.query(insertMemberQuery, [member_phone]);
      const member_id = memberResult.rows[0].member_id;

      // Insert into member_login
      const insertLoginQuery = `
        INSERT INTO member_login (member_id, member_phone, member_password_hash, failed_login_attempts)
        VALUES ($1, $2, $3, 0)
      `;
      await client.query(insertLoginQuery, [member_id, member_phone, member_password_hash]);

      await client.query('COMMIT');

      return c.json({ message: 'Signup successful' }, 201);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during signup:', error);
      throw new HTTPException(500, { message: 'Internal server error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
}

export default signupMember;