// 完成：接收到 point rule 的 request，但只有第一次提交, insert data row 可以完成，之後是 upsert 就不行。

// 想變成，無 data 就 insert，有 data 就 upsert，可以轉 is_active 的 status.

// // src/controllers/admin_setting/post_member_point_rule.ts

// import { pool } from '../db';
// import { type Context } from 'hono';
// import { HTTPException } from 'hono/http-exception';

// interface MemberPointRule {
//     purchase_count?: string;
//     purchase_count_point_awarded?: string;
//     purchase_amount?: string;
//     purchase_amount_point_awarded?: string;
//     points_per_referral?: string;
// }

// export const postMemberPointRule = async (c: Context): Promise<Response> => {

//     console.log('post_member_point_rule function begin')
//     try {
//         // Parse the request body
//         const body: MemberPointRule = await c.req.json();

//         // Get a database client from the pool
//         const client = await pool.connect();

//         try {
//             // Start a transaction
//             await client.query('BEGIN');

//             // Handle Purchase Count Rule
//             if (body.purchase_count && body.purchase_count_point_awarded) {
//                 // Insert into member_point_rule
//                 const ruleName = '購買次數';
//                 const ruleType = 'purchase_count';
//                 const isActive = true;

//                 const insertRuleQuery = `
//           INSERT INTO member_point_rule (rule_name, rule_type, is_active)
//           VALUES ($1, $2, $3)
//           RETURNING member_point_rule_id
//         `;
//                 const ruleResult = await client.query(insertRuleQuery, [ruleName, ruleType, isActive]);
//                 const member_point_rule_id = ruleResult.rows[0].member_point_rule_id;

//                 // Insert into purchase_count_rule_setting
//                 const insertSettingQuery = `
//           INSERT INTO purchase_count_rule_setting (member_point_rule_id, purchase_count, point_awarded)
//           VALUES ($1, $2, $3)
//         `;
//                 await client.query(insertSettingQuery, [
//                     member_point_rule_id,
//                     parseInt(body.purchase_count, 10),
//                     parseInt(body.purchase_count_point_awarded, 10),
//                 ]);
//             }

//             // Handle Purchase Amount Rule
//             if (body.purchase_amount && body.purchase_amount_point_awarded) {
//                 // Insert into member_point_rule
//                 const ruleName = '購買金額';
//                 const ruleType = 'purchase_amount';
//                 const isActive = true;

//                 const insertRuleQuery = `
//           INSERT INTO member_point_rule (rule_name, rule_type, is_active)
//           VALUES ($1, $2, $3)
//           RETURNING member_point_rule_id
//         `;
//                 const ruleResult = await client.query(insertRuleQuery, [ruleName, ruleType, isActive]);
//                 const member_point_rule_id = ruleResult.rows[0].member_point_rule_id;

//                 // Insert into purchase_amount_rule_setting
//                 const insertSettingQuery = `
//           INSERT INTO purchase_amount_rule_setting (member_point_rule_id, purchase_amount, point_awarded)
//           VALUES ($1, $2, $3)
//         `;
//                 await client.query(insertSettingQuery, [
//                     member_point_rule_id,
//                     parseInt(body.purchase_amount, 10),
//                     parseInt(body.purchase_amount_point_awarded, 10),
//                 ]);
//             }

//             // Handle Referral Rule
//             if (body.points_per_referral) {
//                 // Insert into member_point_rule
//                 const ruleName = '會員推薦';
//                 const ruleType = 'referral';
//                 const isActive = true;

//                 const insertRuleQuery = `
//           INSERT INTO member_point_rule (rule_name, rule_type, is_active)
//           VALUES ($1, $2, $3)
//           RETURNING member_point_rule_id
//         `;
//                 const ruleResult = await client.query(insertRuleQuery, [ruleName, ruleType, isActive]);
//                 const member_point_rule_id = ruleResult.rows[0].member_point_rule_id;

//                 // Insert into referral_rule_setting
//                 const insertSettingQuery = `
//           INSERT INTO referral_rule_setting (member_point_rule_id, points_per_referral)
//           VALUES ($1, $2)
//         `;
//                 await client.query(insertSettingQuery, [
//                     member_point_rule_id,
//                     parseInt(body.points_per_referral, 10),
//                 ]);
//             }

//             // Commit the transaction
//             await client.query('COMMIT');

//             // Return a success response
//             return c.json({ message: 'Member point rules successfully inserted.' }, 200);
//         } catch (error) {
//             // Rollback the transaction in case of error
//             await client.query('ROLLBACK');
//             console.error('Error during transaction:', error);
//             throw new HTTPException(500, { message: 'Internal Server Error' });
//         } finally {
//             // Release the client back to the pool
//             client.release();
//         }
//     } catch (error) {
//         console.error('Error in postMemberPointRule:', error);
//         throw new HTTPException(500, { message: 'Internal Server Error' });
//     }
// };

// export default postMemberPointRule;