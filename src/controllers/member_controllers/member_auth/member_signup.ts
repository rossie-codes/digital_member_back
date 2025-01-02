// src/controllers/member_controllers/member_auth/signup.ts

import type { Context } from 'hono';
import { pool, getTenantClient } from '../../db';
import { HTTPException } from 'hono/http-exception';
import Bun from 'bun'; // Assuming Bun.js is available

interface SignupPayload {
  member_name?: string;
  member_birthday?: string;
  member_phone: string;
  referrer_phone?: string;
  member_password: string;
}

function generateRandomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}



async function signupMember(c: Context) {

  console.log('loginMember function begin')


  const app_domain = c.get('app_domain');
  const tenant_host = c.get("tenant_host");
  console.log("tenant at login as tenant_host: ", tenant_host);
  console.log("tenant at login ad app_domain: ", app_domain);

  const pool = await getTenantClient(tenant_host);


  try {
    console.log('Signup request received');
    const { member_name, member_birthday, member_phone, referrer_phone, member_password }: SignupPayload = await c.req.json();

    let points_balance = 0;

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

    let member_referral_code = generateRandomCode(6);

    // Ensure the referral code is unique
    let codeExists = true;
    while (codeExists) {
      const codeQuery =
        "SELECT member_id FROM member WHERE member_referral_code = $1";
      const codeResult = await pool.query(codeQuery, [member_referral_code]);

      if (codeResult.rows.length === 0) {
        // Code is unique
        codeExists = false;
      } else {
        // Generate a new code
        member_referral_code = generateRandomCode(6);
      }
    }


    // Determine membership_tier and membership_expiry_date
    // Get the tier with the lowest membership_tier_sequence
    // Determine membership_tier and membership_expiry_date based on member's points_balance
    const tierQuery = `
                SELECT membership_tier_id, membership_period
                FROM membership_tier
                WHERE require_point <= $1
                ORDER BY require_point DESC
                LIMIT 1
                `;

    const tierResult = await pool.query(tierQuery, [points_balance]);

    console.log("tierResult:", tierResult.rows);

    let membership_tier_id: number | null = null;
    let membership_expiry_date: string | null = null;

    if (tierResult.rows.length > 0) {
      const { membership_tier_id: tierId, membership_period } =
        tierResult.rows[0];

      membership_tier_id = tierId;

      // Set membership_expiry_date based on membership_period
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Reset time to midnight
      const expiryDate = new Date(currentDate);
      expiryDate.setMonth(expiryDate.getMonth() + membership_period);

      // Format the date as YYYY-MM-DD
      membership_expiry_date = expiryDate.toISOString().split("T")[0];

      console.log("membership_expiry_date:", membership_expiry_date);
    } else {
      // Handle case when no tier is matched
      // You may set a default tier or handle it as needed
      console.warn(
        "No matching membership tier found for the given points_balance value."
      );
    }


    // Start transaction
    // const client = await pool.connect();
    const client = await getTenantClient(tenant_host);
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
        INSERT INTO member (
          created_at,
          membership_start_date,
          member_phone,
          member_name,
          member_referral_code,
          points_balance,
          membership_tier_id,
          membership_expiry_date,
          referrer_member_id,
          birthday,
          is_active,
          membership_status,
          point
        ) VALUES (
          NOW(), NOW(),
          $1, $2, $3, $4, $5, $6, $7, $8, 1, 'active', 0
        ) RETURNING member_id
      `;
        const insertMemberValues = [
          member_phone,
          member_name || null,
          member_referral_code,
          points_balance,
          membership_tier_id,
          membership_expiry_date,
          referrer_member_id,
          member_birthday || null];

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
  } finally {
    pool.release();
  }
}

export default signupMember;