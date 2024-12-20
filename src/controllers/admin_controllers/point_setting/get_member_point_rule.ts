// src/controllers/point_setting/get_member_point_rule.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const getMemberPointRule = async (c: Context): Promise<Response> => {
  console.log('getMemberPointRule function begin');
  try {
    // Get a database client from the pool
    // const client = await pool.connect();

    const tenant = c.get("tenant");
    console.log("tenant", tenant);
    const client = await getTenantClient(tenant);
  

    try {
      // Begin transaction (optional, good practice)
      await client.query('BEGIN');

      // Query the member_point_rule table to get active rules
      const activeRulesQuery = `
        SELECT member_point_rule_id, rule_name, rule_type
        FROM member_point_rule
        WHERE is_active = TRUE
      `;

      const activeRulesResult = await client.query(activeRulesQuery);
      const activeRules = activeRulesResult.rows;

      // Initialize the rules object
      const rules: any = {};

      for (const rule of activeRules) {
        const { member_point_rule_id, rule_name, rule_type } = rule;

        if (rule_type === 'purchase_amount') {
          // Get settings from purchase_amount_rule_setting
          const purchaseAmountSettingQuery = `
            SELECT purchase_amount, point_awarded
            FROM purchase_amount_rule_setting
            WHERE member_point_rule_id = $1
          `;
          const purchaseAmountSettingResult = await client.query(purchaseAmountSettingQuery, [member_point_rule_id]);
          if (purchaseAmountSettingResult.rows.length > 0) {
            const settings = purchaseAmountSettingResult.rows[0];
            rules.purchase_amount = {
              member_point_rule_id,
              rule_name,
              rule_type,
              purchase_amount: settings.purchase_amount,
              point_awarded: settings.point_awarded,
            };
          } else {
            console.warn(`No settings found for purchase_amount rule with ID ${member_point_rule_id}`);
          }
        } else if (rule_type === 'purchase_count') {
          // Get settings from purchase_count_rule_setting
          const purchaseCountSettingQuery = `
            SELECT purchase_count, point_awarded
            FROM purchase_count_rule_setting
            WHERE member_point_rule_id = $1
          `;
          const purchaseCountSettingResult = await client.query(purchaseCountSettingQuery, [member_point_rule_id]);
          if (purchaseCountSettingResult.rows.length > 0) {
            const settings = purchaseCountSettingResult.rows[0];
            rules.purchase_count = {
              member_point_rule_id,
              rule_name,
              rule_type,
              purchase_count: settings.purchase_count,
              point_awarded: settings.point_awarded,
            };
          } else {
            console.warn(`No settings found for purchase_count rule with ID ${member_point_rule_id}`);
          }
        } else if (rule_type === 'referral') {
          // Get settings from referral_rule_setting
          const referralSettingQuery = `
            SELECT points_per_referral
            FROM referral_rule_setting
            WHERE member_point_rule_id = $1
          `;
          const referralSettingResult = await client.query(referralSettingQuery, [member_point_rule_id]);
          if (referralSettingResult.rows.length > 0) {
            const settings = referralSettingResult.rows[0];
            rules.referral = {
              member_point_rule_id,
              rule_name,
              rule_type,
              points_per_referral: settings.points_per_referral,
            };
          } else {
            console.warn(`No settings found for referral rule with ID ${member_point_rule_id}`);
          }
        } else {
          // Unknown rule_type
          console.error('Unknown rule_type:', rule_type);
        }
      }

      // Commit the transaction
      await client.query('COMMIT');

      // Return the rules as a JSON response
      return rules
    } catch (error) {
      // Rollback the transaction in case of error
      await client.query('ROLLBACK');
      console.error('Error in getMemberPointRule transaction:', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error in getMemberPointRule:', error);
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
};

export default getMemberPointRule;