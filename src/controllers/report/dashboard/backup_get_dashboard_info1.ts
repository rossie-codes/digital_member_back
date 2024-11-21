// 完成 return new_member_count, expiring_member_count, active_member_count

// 想加入 return name of membership_tier, count of each membership_tier member, count of each membership_tier member that will be expired in the current month

// // src/controllers/report/dashboard/get_dashboard_info.ts

// import { pool } from '../../db';
// import { type Context } from 'hono';

// interface DashboardInfo {
//   new_member_count: number;
//   expiring_member_count: number;
//   active_member_count: number;
// }

// async function getDashboardInfo(): Promise<DashboardInfo> {
//   try {
//     // Get the current month and year
//     const now = new Date();
//     const currentYear = now.getFullYear();
//     const currentMonth = now.getMonth() + 1;

//     // Query for new members in the current month
//     const newMembersQuery = `
//       SELECT COUNT(*) AS count
//       FROM member
//       WHERE EXTRACT(YEAR FROM created_at) = $1
//         AND EXTRACT(MONTH FROM created_at) = $2
//     `;
//     const newMembersResult = await pool.query(newMembersQuery, [currentYear, currentMonth]);
//     const new_member_count = parseInt(newMembersResult.rows[0].count, 10);

//     // Query for members expiring in the current month
//     const expiringMembersQuery = `
//       SELECT COUNT(*) AS count
//       FROM member
//       WHERE EXTRACT(YEAR FROM membership_expiry_date) = $1
//         AND EXTRACT(MONTH FROM membership_expiry_date) = $2
//     `;
//     const expiringMembersResult = await pool.query(expiringMembersQuery, [currentYear, currentMonth]);
//     const expiring_member_count = parseInt(expiringMembersResult.rows[0].count, 10);

//     // Query for active members
//     const activeMembersQuery = `
//       SELECT COUNT(*) AS count
//       FROM member
//       WHERE membership_status = 'active'
//     `;
//     const activeMembersResult = await pool.query(activeMembersQuery);
//     const active_member_count = parseInt(activeMembersResult.rows[0].count, 10);

//     return {
//       new_member_count: new_member_count,
//       expiring_member_count: expiring_member_count,
//       active_member_count: active_member_count,
//     };
//   } catch (error) {
//     console.error('Error fetching dashboard info:', error);
//     throw error;
//   }
// }

// export default getDashboardInfo;