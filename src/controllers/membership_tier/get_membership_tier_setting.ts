// src/controllers/membership_tier/get_membership_tier_setting.ts

import { pool } from '../db';
import { type Context } from 'hono';

interface MembershipTier {
  membership_tier_name: string;
  membership_tier_sequence: number;
  require_point: number;
  extend_membership_point: number;
  point_multiplier: number; // Original multiplier
  membership_period: number;
}

interface MembershipTierResponse {
  membership_tier_name: string;
  membership_tier_sequence: number;
  require_point: number;
  extend_membership_point: number;
  point_multiplier: number; // Multiplier adjusted by /1000
  membership_period: number;
}

async function getMembershipTierSetting(): Promise<MembershipTierResponse[]> {
  try {
    // Query to fetch all membership tiers sorted by sequence
    console.log('start')
    
    const data = await pool.query('SELECT * FROM membership_tier ORDER BY membership_tier_sequence ASC');

    console.log("Membership tier settings (sorted):", data.rows);

    const result: MembershipTier[] = data.rows as MembershipTier[];

    console.log("Processed membership tier settings:", result);

    // Process each tier to adjust point_multiplier
    const processedResult: MembershipTierResponse[] = result.map(tier => ({
      ...tier,
      point_multiplier: tier.point_multiplier / 1000, // Adjusting the multiplier
    }));

    console.log("Processed membership tier settings:", processedResult);

    return processedResult as MembershipTierResponse[];
  } catch (error) {
    console.error("Error fetching membership tier settings:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export default getMembershipTierSetting;