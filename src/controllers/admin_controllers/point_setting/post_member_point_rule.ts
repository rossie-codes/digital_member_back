// src/controllers/point_setting/post_member_point_rule.ts

import { pool } from '../../db';
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

interface PurchaseCountRuleData {
    purchase_count: number;
    point_awarded: number;
    is_active: boolean;
}

interface PurchaseAmountRuleData {
    purchase_amount: number;
    point_awarded: number;
    is_active: boolean;
}

interface ReferralRuleData {
    points_per_referral: number;
    is_active: boolean;
}

interface MemberPointRule {
    purchase_count?: PurchaseCountRuleData;
    purchase_amount?: PurchaseAmountRuleData;
    referral?: ReferralRuleData;
}

export const postMemberPointRule = async (c: Context): Promise<Response> => {

    console.log('post_member_point_rule function begin')
    try {
        // Parse the request body
        const body: MemberPointRule = await c.req.json();

        // Get a database client from the pool
        const client = await pool.connect();

        try {
            // Start a transaction
            await client.query('BEGIN');

            // Handle Purchase Count Rule
            const purchaseCountData = body.purchase_count;
            if (purchaseCountData && purchaseCountData.is_active) {
                console.log('purchase_count transaction begin');

                const { purchase_count, point_awarded } = purchaseCountData;

                // Validate data
                if (typeof purchase_count !== 'number' || purchase_count <= 0 ||
                    typeof point_awarded !== 'number' || point_awarded <= 0) {
                    throw new HTTPException(400, { message: 'Invalid purchase count rule data' });
                }

                const ruleName = '購買次數';
                const ruleType = 'purchase_count';
                const isActive = true;

                // Upsert into member_point_rule
                const upsertRuleQuery = `
                    INSERT INTO member_point_rule (rule_name, rule_type, is_active)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (rule_type) DO UPDATE SET
                      rule_name = EXCLUDED.rule_name,
                      is_active = EXCLUDED.is_active
                    RETURNING member_point_rule_id
                `;
                const ruleResult = await client.query(upsertRuleQuery, [ruleName, ruleType, isActive]);
                const member_point_rule_id = ruleResult.rows[0].member_point_rule_id;

                // Upsert into purchase_count_rule_setting
                const upsertSettingQuery = `
                    INSERT INTO purchase_count_rule_setting (member_point_rule_id, purchase_count, point_awarded)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (member_point_rule_id) DO UPDATE SET
                      purchase_count = EXCLUDED.purchase_count,
                      point_awarded = EXCLUDED.point_awarded
                `;
                await client.query(upsertSettingQuery, [
                    member_point_rule_id,
                    purchase_count,
                    point_awarded,
                ]);
            } else {
                // Deactivate the rule if not provided or not active
                const ruleType = 'purchase_count';
                const deactivateRuleQuery = `
                    UPDATE member_point_rule SET is_active = false WHERE rule_type = $1
                `;
                await client.query(deactivateRuleQuery, [ruleType]);
            }

            // Handle Purchase Amount Rule
            const purchaseAmountData = body.purchase_amount;
            if (purchaseAmountData && purchaseAmountData.is_active) {
                console.log('purchase_amount transaction begin');

                const { purchase_amount, point_awarded } = purchaseAmountData;

                // Validate data
                if (typeof purchase_amount !== 'number' || purchase_amount <= 0 ||
                    typeof point_awarded !== 'number' || point_awarded <= 0) {
                    throw new HTTPException(400, { message: 'Invalid purchase amount rule data' });
                }

                const ruleName = '購買金額';
                const ruleType = 'purchase_amount';
                const isActive = true;

                // Upsert into member_point_rule
                const upsertRuleQuery = `
                    INSERT INTO member_point_rule (rule_name, rule_type, is_active)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (rule_type) DO UPDATE SET
                      rule_name = EXCLUDED.rule_name,
                      is_active = EXCLUDED.is_active
                    RETURNING member_point_rule_id
                `;
                const ruleResult = await client.query(upsertRuleQuery, [ruleName, ruleType, isActive]);
                const member_point_rule_id = ruleResult.rows[0].member_point_rule_id;

                // Upsert into purchase_amount_rule_setting
                const upsertSettingQuery = `
                    INSERT INTO purchase_amount_rule_setting (member_point_rule_id, purchase_amount, point_awarded)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (member_point_rule_id) DO UPDATE SET
                      purchase_amount = EXCLUDED.purchase_amount,
                      point_awarded = EXCLUDED.point_awarded
                `;
                await client.query(upsertSettingQuery, [
                    member_point_rule_id,
                    purchase_amount,
                    point_awarded,
                ]);
            } else {
                // Deactivate the rule if not provided or not active
                const ruleType = 'purchase_amount';
                const deactivateRuleQuery = `
                    UPDATE member_point_rule SET is_active = false WHERE rule_type = $1
                `;
                await client.query(deactivateRuleQuery, [ruleType]);
            }

            // Handle Referral Rule
            const referralData = body.referral;
            if (referralData && referralData.is_active) {
                console.log('referral transaction begin');

                const { points_per_referral } = referralData;

                // Validate data
                if (typeof points_per_referral !== 'number' || points_per_referral <= 0) {
                    throw new HTTPException(400, { message: 'Invalid referral rule data' });
                }

                const ruleName = '會員推薦';
                const ruleType = 'referral';
                const isActive = true;

                // Upsert into member_point_rule
                const upsertRuleQuery = `
                    INSERT INTO member_point_rule (rule_name, rule_type, is_active)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (rule_type) DO UPDATE SET
                      rule_name = EXCLUDED.rule_name,
                      is_active = EXCLUDED.is_active
                    RETURNING member_point_rule_id
                `;
                const ruleResult = await client.query(upsertRuleQuery, [ruleName, ruleType, isActive]);
                const member_point_rule_id = ruleResult.rows[0].member_point_rule_id;

                // Upsert into referral_rule_setting
                const upsertSettingQuery = `
                    INSERT INTO referral_rule_setting (member_point_rule_id, points_per_referral)
                    VALUES ($1, $2)
                    ON CONFLICT (member_point_rule_id) DO UPDATE SET
                      points_per_referral = EXCLUDED.points_per_referral
                `;
                await client.query(upsertSettingQuery, [
                    member_point_rule_id,
                    points_per_referral,
                ]);
            } else {
                // Deactivate the rule if not provided or not active
                const ruleType = 'referral';
                const deactivateRuleQuery = `
                    UPDATE member_point_rule SET is_active = false WHERE rule_type = $1
                `;
                await client.query(deactivateRuleQuery, [ruleType]);
            }

            // Commit the transaction
            await client.query('COMMIT');

            // Return a success response
            return c.json({ message: 'Member point rules successfully inserted.' }, 200);
        } catch (error) {
            // Rollback the transaction in case of error
            await client.query('ROLLBACK');
            console.error('Error during transaction:', error);
            throw new HTTPException(500, { message: 'Internal Server Error' });
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error('Error in postMemberPointRule:', error);
        throw new HTTPException(500, { message: 'Internal Server Error' });
    }
};

export default postMemberPointRule;