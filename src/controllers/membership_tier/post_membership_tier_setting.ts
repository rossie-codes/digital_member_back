// src/controllers/membership_tier/post_membership_tier_setting.ts

import { pool } from '../db';
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception'

interface MembershipTier {
  member_tier_name: string;
  member_tier_sequence: number;
  require_point: number;
  extend_membership_point: number;
  point_multiplier: number;
  membership_period: number;
}

async function postMembershipTier(c: Context): Promise<Response> {
  try {
    // Extract the JSON body from the request
    const tiers: MembershipTier[] = await c.req.json();

    // Input Validation
    if (!tiers || !Array.isArray(tiers)) {
      throw new HTTPException(400, { message: 'Invalid input: tiers should be an array.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Upsert the membership_tier records
      const upsertQuery = `
        INSERT INTO membership_tier 
          (member_tier_name, member_tier_sequence, require_point, extend_membership_point, point_multiplier, membership_period)
        VALUES 
          ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (member_tier_sequence) DO UPDATE SET 
          member_tier_name = EXCLUDED.member_tier_name,
          require_point = EXCLUDED.require_point,
          extend_membership_point = EXCLUDED.extend_membership_point,
          point_multiplier = EXCLUDED.point_multiplier,
          membership_period = EXCLUDED.membership_period
      `;

      // Upsert each tier
      for (const tier of tiers) {
        await client.query(upsertQuery, [
          tier.member_tier_name,
          tier.member_tier_sequence,
          tier.require_point,
          tier.extend_membership_point,
          tier.point_multiplier,
          tier.membership_period,
        ]);
      }

      // Recalculate and update member_tier_id for all members
      const updateMemberTiersQuery = `
        UPDATE member
        SET member_tier_id = sub.member_tier_id
        FROM (
          SELECT
            member_id,
            mt.member_tier_id
          FROM
            member m
          JOIN membership_tier mt ON m.point >= mt.require_point
          LEFT JOIN membership_tier mt2 ON mt2.require_point > mt.require_point AND m.point >= mt2.require_point
          WHERE mt2.member_tier_id IS NULL
        ) AS sub
        WHERE member.member_id = sub.member_id
      `;

      await client.query(updateMemberTiersQuery);

      await client.query('COMMIT');
      console.log(`Successfully upserted ${tiers.length} membership tiers and updated member tiers.`);

      // Return a success response
      return c.json(
        {
          message: `Successfully upserted ${tiers.length} membership tiers and updated member tiers.`,
        },
        200
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error setting membership tiers:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in postMembershipTier:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default postMembershipTier;