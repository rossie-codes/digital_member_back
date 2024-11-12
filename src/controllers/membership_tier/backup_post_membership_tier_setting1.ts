// 完成：Post membership_tier_setting 更改現有各個 tier 的 setting

// 想 submit 更改後，再計算 table member column membership_tier_id


// // src/controllers/membership_tier/post_membership_tier_setting.ts

// import { pool } from '../db';
// import { type Context } from 'hono';
// import { HTTPException } from 'hono/http-exception'


// interface MembershipTier {
//   membership_tier_name: string;
//   membership_tier_sequence: number;
//   require_point: number;
//   extend_membership_point: number;
//   point_multiplier: number;
//   membership_period: number;
// }

// interface PostMembershipTierRequest {
//   tiers: MembershipTier[];
// }


// const BATCH_SIZE = 500; // Define an appropriate batch size based on your system's capacity

// async function postMembershipTier(c: Context): Promise<{ message: string; processedTiers: number }> {
//   // Extract the JSON body from the request
//   const tiers: MembershipTier = await c.req.json();

//   // Input Validation
//   if (!tiers || !Array.isArray(tiers)) {
//     throw new HTTPException(400, { message: 'Invalid input: tiers should be an array.'});
//   }

//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     const upsertQuery = `
//       INSERT INTO membership_tier 
//         (membership_tier_name, membership_tier_sequence, require_point, extend_membership_point, point_multiplier, membership_period)
//       VALUES 
//         ($1, $2, $3, $4, $5, $6)
//       ON CONFLICT (membership_tier_sequence) DO UPDATE SET 
//         membership_tier_name = EXCLUDED.membership_tier_name,
//         require_point = EXCLUDED.require_point,
//         extend_membership_point = EXCLUDED.extend_membership_point,
//         point_multiplier = EXCLUDED.point_multiplier,
//         membership_period = EXCLUDED.membership_period
//     `;

//     // Function to process a single batch
//     const processBatch = async (batchTiers: MembershipTier[]) => {
//       const upsertPromises = batchTiers.map(tier =>
//         client.query(upsertQuery, [
//           tier.membership_tier_name,
//           tier.membership_tier_sequence,
//           tier.require_point,
//           tier.extend_membership_point,
//           tier.point_multiplier,
//           tier.membership_period
//         ])
//       );
//       await Promise.all(upsertPromises);
//       console.log(`Processed batch of ${batchTiers.length} tiers.`);
//     };

//     // Iterate through tiers in batches
//     for (let i = 0; i < tiers.length; i += BATCH_SIZE) {
//       const batch = tiers.slice(i, i + BATCH_SIZE);
//       await processBatch(batch);
//     }

//     await client.query('COMMIT');
//     console.log(`Successfully upserted ${tiers.length} membership tiers.`);

//     return { message: `Successfully upserted ${tiers.length} membership tiers.`, processedTiers: tiers.length };
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Error setting membership tiers:', error);
//     // Re-throw the error to be handled by the route handler
//     throw new HTTPException(500, { message: 'Internal Server Error'});
//   } finally {
//     client.release();
//   }
// }

// export default postMembershipTier;