// src/controllers/member/post_new_member.ts

import { pool } from '../db';
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception'


interface NewMember {
    member_name: string
    member_phone: number
    birthday: string | null
    referrer_phone: number | null
    point: number
}


function generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


const BATCH_SIZE = 500; // Define an appropriate batch size based on your system's capacity

async function postNewMember(c: Context): Promise<Response> {
    console.log('post_new_member function begin')
    try {
        // Parse the request body
        const body: NewMember = await c.req.json();

        // Destructure the data
        const { member_name, member_phone, birthday, referrer_phone, point } = body;
        console.log(body)
        // Get a database client from the pool
        const client = await pool.connect();

        try {
            // Start a transaction
            await client.query('BEGIN');

            // Check if a member with the given phone number already exists
            const existingMemberQuery = 'SELECT member_id FROM member WHERE member_phone = $1';
            const existingMemberResult = await client.query(existingMemberQuery, [member_phone]);

            if (existingMemberResult.rows.length > 0) {
                // Member with this phone number already exists
                await client.query('ROLLBACK');
                console.log('Member with this phone number already exists.')
                // Correct way to set status code in Hono
                return c.json(
                    { message: 'Member with this phone number already exists.' },
                    { status: 400 }
                );
                // throw new HTTPException(400, { message: 'Member with this phone number already exists.'});
            }

            let referrer_member_id: number | null = null;

            if (referrer_phone) {
                // Check if referrer exists
                const referrerQuery = 'SELECT member_id FROM member WHERE member_phone = $1';
                const referrerResult = await client.query(referrerQuery, [referrer_phone]);

                if (referrerResult.rows.length === 0) {
                    // Referrer does not exist
                    await client.query('ROLLBACK');
                    return c.json(
                        { message: 'Referrer phone number does not exist.' },
                        { status: 400 }
                    );
                    // throw new HTTPException(400, { message: 'Member with this phone number already exists.'});
                }

                referrer_member_id = referrerResult.rows[0].member_id;
            }

            // Generate a unique member_referral_code
            let member_referral_code = generateRandomCode(6);

            // Ensure the referral code is unique
            let codeExists = true;
            while (codeExists) {
                const codeQuery = 'SELECT member_id FROM member WHERE member_referral_code = $1';
                const codeResult = await client.query(codeQuery, [member_referral_code]);

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
            // Determine membership_tier and membership_expiry_date based on member's point
            const tierQuery = `
                SELECT membership_tier_id, membership_period
                FROM membership_tier
                WHERE require_point <= $1
                ORDER BY require_point DESC
                LIMIT 1
                `;

            const tierResult = await client.query(tierQuery, [point]);

            let membership_tier_id: number | null = null;
            let membership_expiry_date: string | null = null;

            if (tierResult.rows.length > 0) {
                const { membership_tier_id: tierId, membership_period } = tierResult.rows[0];

                membership_tier_id = tierId;

                // Set membership_expiry_date based on membership_period
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0); // Reset time to midnight
                const expiryDate = new Date(currentDate);
                expiryDate.setMonth(expiryDate.getMonth() + membership_period);

                // Format the date as YYYY-MM-DD
                membership_expiry_date = expiryDate.toISOString().split('T')[0];
            } else {
                // Handle case when no tier is matched
                // You may set a default tier or handle it as needed
                console.warn('No matching membership tier found for the given point value.');
            }

            // Insert the new member
            const insertMemberQuery = `
            INSERT INTO member (
              created_at,
              member_phone,
              member_name,
              member_referral_code,
              point,
              membership_tier_id,
              membership_expiry_date,
              referrer_member_id,
              birthday,
              is_active
            ) VALUES (
              NOW(),
              $1, $2, $3, $4, $5, $6, $7, $8, 1
            ) RETURNING member_id
          `;

            const insertMemberValues = [
                member_phone,
                member_name,
                member_referral_code,
                point,
                membership_tier_id,
                membership_expiry_date,
                referrer_member_id,
                birthday,
            ];

            const insertMemberResult = await client.query(insertMemberQuery, insertMemberValues);

            // Commit the transaction
            await client.query('COMMIT');

            // Return success response with the new member ID
            return c.json(
                {
                    message: 'New member added successfully.',
                    member_id: insertMemberResult.rows[0].member_id,
                },
                200
            );
        } catch (error) {
            // Roll back the transaction on error
            await client.query('ROLLBACK');
            console.error('Error adding new member:', error);
            throw new HTTPException(500, { message: 'Internal Server Error' });
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error('Error in postNewMember:', error);
        throw new HTTPException(500, { message: 'Internal Server Error' });
    }
}





export default postNewMember;