// 完成基本 table get all member data

// 想加入 pagination ，只 fetch data needed

// // src/controllers/member/get_member_list.ts

// import { pool } from '../db';
// import { type Context } from 'hono';

// interface Member {
//   member_id: number;
//   created_at: string;
//   created_by: number | null;
//   updated_at: string;
//   updated_by: number | null;
//   member_phone: string;
//   member_name: string;
//   member_referral_code: string;
//   point: number;
//   membership_tier_id: number | null;
//   membership_expiry_date: string;
//   referrer_member_id: number | null;
//   birthday: string | null;
//   is_active: number; // Consider changing to boolean
//   member_note: string | null;
//   member_tag: string[] | null; // Adjust type if necessary
//   state_code: string | null;
//   // Add a nested object to hold membership tier details
//   membership_tier?: {
//     membership_tier_id: number;
//     membership_tier_name: string;
//     membership_tier_sequence: number;
//     require_point: number;
//     extend_membership_point: number;
//     point_multiplier: number;
//     membership_period: number;
//   };
// }



// async function getMemberList(): Promise<Member[]> {
//   try {
//     const query = `
//       SELECT
//         m.*,
//         mt.membership_tier_id,
//         mt.membership_tier_name,
//         mt.membership_tier_sequence,
//         mt.require_point,
//         mt.extend_membership_point,
//         mt.point_multiplier,
//         mt.membership_period
//       FROM
//         member m
//       LEFT JOIN
//         membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
//     `;
//     const data = await pool.query(query);
//     const members = data.rows.map((row) => {
//       // Construct the Member object
//       const member: Member = {
//         member_id: row.member_id,
//         created_at: row.created_at,
//         created_by: row.created_by,
//         updated_at: row.updated_at,
//         updated_by: row.updated_by,
//         member_phone: row.member_phone,
//         member_name: row.member_name,
//         member_referral_code: row.member_referral_code,
//         point: row.point,
//         membership_tier_id: row.membership_tier_id,
//         membership_expiry_date: row.membership_expiry_date,
//         referrer_member_id: row.referrer_member_id,
//         birthday: row.birthday,
//         is_active: row.is_active,
//         member_note: row.member_note,
//         member_tag: row.member_tag,
//         state_code: row.state_code,
//         // Include the membership tier details if available
//         membership_tier: row.membership_tier_id
//           ? {
//               membership_tier_id: row.membership_tier_id,
//               membership_tier_name: row.membership_tier_name,
//               membership_tier_sequence: row.membership_tier_sequence,
//               require_point: row.require_point,
//               extend_membership_point: row.extend_membership_point,
//               point_multiplier: row.point_multiplier,
//               membership_period: row.membership_period,
//             }
//           : undefined,
//       };
//       return member;
//     });

//     return members;
//   } catch (error) {
//     console.error('Database query error:', error);
//     throw new Error('Database query failed');
//   }
// }

// export default getMemberList;