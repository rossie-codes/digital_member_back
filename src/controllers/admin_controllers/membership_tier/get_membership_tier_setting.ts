// src/controllers/membership_tier/get_membership_tier_setting.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
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

async function getMembershipTierSetting(c: Context): Promise<MembershipTierResponse[]> {
  
  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);
  
  try {
    // Query to fetch all membership tiers sorted by sequence
    console.log('getMembershipTierSetting function start')

    const data = await pool.query('SELECT * FROM membership_tier ORDER BY membership_tier_sequence ASC');


    const result: MembershipTier[] = data.rows as MembershipTier[];

    // Process each tier to adjust point_multiplier
    const processedResult: MembershipTierResponse[] = result.map(tier => ({
      ...tier,
      point_multiplier: tier.point_multiplier / 1000, // Adjusting the multiplier
    }));

    console.log('getMembershipTierSetting function done')

    return processedResult as MembershipTierResponse[];
  } catch (error) {
    console.error("Error fetching membership tier settings:", error);
    throw error; // Re-throw the error to be handled by the caller
  } finally {
    pool.release();
  }
}

export default getMembershipTierSetting;