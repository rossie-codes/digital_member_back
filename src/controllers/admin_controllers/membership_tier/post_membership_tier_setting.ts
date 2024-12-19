// src/controllers/membership_tier/post_membership_tier_setting.ts

import { pool } from '../../db';
import { type Context } from 'hono';

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

interface AdminSetting {
  membership_extend_method: number;
  membership_end_result: number;
  membership_period: number;
}

interface Payload {
  membership_period: string;
  membership_extend_method: string;
  membership_end_result: string;
  membership_tiers: MembershipTier[];
}

async function postMembershipTierSetting(c: Context): Promise<Response> {
  try {
    // Extract the JSON body from the request
    const payload: Payload = await c.req.json();

    const {
      membership_period,
      membership_extend_method,
      membership_end_result,
      membership_tiers,
    } = payload;

    const admin_setting_id = 1;

    // Input Validation
    if (!membership_tiers || !Array.isArray(membership_tiers)) {
      return c.json({ message: 'Invalid input: membership_tiers should be an array.' }, 400);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Upsert the admin_setting record
      const upsertAdminSettingQuery = `
        INSERT INTO admin_setting 
          (admin_setting_id, membership_extend_method, membership_end_result, membership_period)
        VALUES 
          ($1, $2, $3, $4)
        ON CONFLICT (admin_setting_id) DO UPDATE SET 
          membership_extend_method = EXCLUDED.membership_extend_method,
          membership_end_result = EXCLUDED.membership_end_result,
          membership_period = EXCLUDED.membership_period
      `;
      await client.query(upsertAdminSettingQuery, [
        admin_setting_id,
        parseInt(membership_extend_method, 10),
        parseInt(membership_end_result, 10),
        parseInt(membership_period, 10),
      ]);

      // Upsert the membership_tier records
      const upsertMembershipTierQuery = `
        INSERT INTO membership_tier 
          (membership_tier_id, membership_tier_name, membership_tier_sequence, require_point, extend_membership_point, point_multiplier, membership_period, original_point, multiplied_point)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (membership_tier_id) DO UPDATE SET 
          membership_tier_name = EXCLUDED.membership_tier_name,
          membership_tier_sequence = EXCLUDED.membership_tier_sequence,
          require_point = EXCLUDED.require_point,
          extend_membership_point = EXCLUDED.extend_membership_point,
          point_multiplier = EXCLUDED.point_multiplier,
          membership_period = EXCLUDED.membership_period,
          original_point = EXCLUDED.original_point,
          multiplied_point = EXCLUDED.multiplied_point
      `;

      for (const tier of membership_tiers) {
        await client.query(upsertMembershipTierQuery, [
          tier.membership_tier_id,
          tier.membership_tier_name,
          tier.membership_tier_sequence,
          tier.require_point,
          tier.extend_membership_point,
          tier.point_multiplier,
          tier.membership_period,
          tier.original_point,
          tier.multiplied_point,
        ]);
      }

      await client.query('COMMIT');

      return c.json({ message: 'Membership tier settings updated successfully' }, 200);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating membership tier settings:', error);
      return c.json({ message: 'Failed to update membership tier settings' }, 500);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return c.json({ message: 'Invalid request' }, 400);
  }
}

export default postMembershipTierSetting;