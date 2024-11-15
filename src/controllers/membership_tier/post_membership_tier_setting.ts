// src/controllers/membership_tier/post_membership_tier_setting.ts

import { pool } from '../db';
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

interface MembershipTier {
  membership_tier_id?: number;
  membership_tier_name: string;
  membership_tier_sequence: number;
  require_point: number;
  extend_membership_point: number;
  point_multiplier: number;
  membership_period: number;
  original_point?: number;
  multiplied_point?: number;
}

async function postMembershipTierSetting(c: Context): Promise<Response> {
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
          (membership_tier_name, membership_tier_sequence, require_point, extend_membership_point, point_multiplier, membership_period, original_point, multiplied_point)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (membership_tier_sequence) DO UPDATE SET 
          membership_tier_name = EXCLUDED.membership_tier_name,
          require_point = EXCLUDED.require_point,
          extend_membership_point = EXCLUDED.extend_membership_point,
          point_multiplier = EXCLUDED.point_multiplier,
          membership_period = EXCLUDED.membership_period,
          original_point = EXCLUDED.original_point,
          multiplied_point = EXCLUDED.multiplied_point
      `;

      // Upsert each tier
      for (const tier of tiers) {
        // Validate required fields
        if (
          !tier.membership_tier_name ||
          typeof tier.membership_tier_sequence !== 'number' ||
          typeof tier.require_point !== 'number' ||
          typeof tier.extend_membership_point !== 'number' ||
          typeof tier.point_multiplier !== 'number' ||
          typeof tier.membership_period !== 'number'
        ) {
          throw new HTTPException(400, { message: 'Invalid or missing required tier fields.' });
        }

        // Upsert the tier
        await client.query(upsertQuery, [
          tier.membership_tier_name,
          tier.membership_tier_sequence,
          tier.require_point,
          tier.extend_membership_point,
          tier.point_multiplier,
          tier.membership_period,
          tier.original_point || null,
          tier.multiplied_point || null,
        ]);
      }

      // Recalculate and update membership_tier_id for all members
      const updateMembershipTiersQuery = `
        UPDATE member
        SET membership_tier_id = sub.membership_tier_id
        FROM (
          SELECT
            m.member_id,
            mt.membership_tier_id
          FROM
            member m
          JOIN membership_tier mt ON m.point >= mt.require_point
          LEFT JOIN membership_tier mt2 ON mt2.require_point > mt.require_point AND m.point >= mt2.require_point
          WHERE mt2.membership_tier_id IS NULL
        ) AS sub
        WHERE member.member_id = sub.member_id
      `;
      await client.query(updateMembershipTiersQuery);

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
    console.error('Error in postMembershipTierSetting:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default postMembershipTierSetting;