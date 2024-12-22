// src/controllers/membership_tier/get_membership_basic_setting.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import { type Context } from 'hono';

interface getMembershipBasicSetting {
  membership_extend_method: number;
  membership_end_result: number;
  membership_period: number;
}

async function getMembershipBasicSetting(c: Context): Promise<getMembershipBasicSetting> {
  
  const tenant = c.get("tenant_host");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);

  try {
    // Query to fetch membership basic settings
    console.log('getMembershipBasicSetting function begin');

    const query = `
      SELECT
        membership_extend_method,
        membership_end_result,
        membership_period
      FROM admin_setting
      LIMIT 1
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      throw new Error('Membership basic settings not found');
    }

    const row = result.rows[0];

    const membershipBasicSetting: getMembershipBasicSetting = {
      membership_extend_method: row.membership_extend_method,
      membership_end_result: row.membership_end_result,
      membership_period: row.membership_period,
    };

    console.log('getMembershipBasicSetting function done');

    return membershipBasicSetting;
  } catch (error) {
    console.error("Error fetching membership basic settings:", error);
    throw error; // Re-throw the error to be handled by the caller
  } finally {
    pool.release()
  }
}

export default getMembershipBasicSetting;