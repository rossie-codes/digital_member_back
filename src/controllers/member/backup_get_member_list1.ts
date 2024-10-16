// 完成取得所以 member 資料

// 想將 membership_tier 變成 foreign key to membership_tier 

// // src/controllers/member/get_member_list.ts

// import { pool } from '../db';
// import { type Context } from 'hono';

// interface Member {
//   member_id: number;
//   created_at: string;
//   created_by: number;
//   updated_at: string;
//   updated_by: number;
//   member_phone: string;
//   member_name: string;
//   member_referral_code: string;
//   point: number;
//   membership_tier: string; // Or number if it's truly numerical
//   membership_expiry_date: string;
//   referrer_member_id: number;
//   birthday: string;
//   is_active: number; //  Consider using a boolean if this represents a true/false value
//   member_note: string | null;
//   member_tag: string | null;
//   state_code: string | null;
// }

// async function getMemberList(): Promise<Member[]> {
//   try {
//     const data = await pool.query('SELECT * FROM Member');
//     return data.rows as Member[]; // Ensures type safety
//   } catch (error) {
//     console.error('Database query error:', error);
//     throw new Error('Database query failed');
//   }
// }

// export default getMemberList;