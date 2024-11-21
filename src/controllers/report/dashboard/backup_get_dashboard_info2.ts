// 完成加入 membership_tiers, membership_tier_counts, membership_tier_expiring_member_count

// 想加入各級新會員的數目及 change percentage

// // src/controllers/report/dashboard/get_dashboard_info.ts

// import { pool } from '../../db';
// // import { type Context } from 'hono'; // Not used in this function

// interface DashboardInfo {
//   new_member_count: number;
//   expiring_member_count: number;
//   active_member_count: number;
//   membership_tiers: string[];
//   membership_tier_counts: { [membership_name: string]: number };
//   membership_tier_expiring_member_count: { [membership_name: string]: number };
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

//     // Query for membership tiers
//     const membershipTiersQuery = `
//       SELECT membership_tier_id, membership_tier_name
//       FROM membership_tier
//       ORDER BY membership_tier_sequence
//     `;
//     const membershipTiersResult = await pool.query(membershipTiersQuery);
//     const membership_tiers = membershipTiersResult.rows.map(row => row.membership_tier_name);

//     // Initialize membership_tier_counts with zero counts
//     const membership_tier_counts: { [membership_name: string]: number } = {};
//     membership_tiers.forEach(name => {
//       membership_tier_counts[name] = 0;
//     });

//     // Query for membership tier counts
//     const tierCountsQuery = `
//       SELECT mt.membership_tier_name, COUNT(*) as count
//       FROM member m
//       JOIN membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
//       GROUP BY mt.membership_tier_name
//     `;
//     const tierCountsResult = await pool.query(tierCountsQuery);
//     tierCountsResult.rows.forEach(row => {
//       membership_tier_counts[row.membership_tier_name] = parseInt(row.count, 10);
//     });

//     // Initialize membership_tier_expiring_member_count with zero counts
//     const membership_tier_expiring_member_count: { [membership_name: string]: number } = {};
//     membership_tiers.forEach(name => {
//       membership_tier_expiring_member_count[name] = 0;
//     });

//     // Query for membership tier expiring member counts in current month
//     const tierExpiringCountsQuery = `
//       SELECT mt.membership_tier_name, COUNT(*) as count
//       FROM member m
//       JOIN membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
//       WHERE EXTRACT(YEAR FROM m.membership_expiry_date) = $1
//         AND EXTRACT(MONTH FROM m.membership_expiry_date) = $2
//       GROUP BY mt.membership_tier_name
//     `;
//     const tierExpiringCountsResult = await pool.query(tierExpiringCountsQuery, [currentYear, currentMonth]);
//     tierExpiringCountsResult.rows.forEach(row => {
//       membership_tier_expiring_member_count[row.membership_tier_name] = parseInt(row.count, 10);
//     });

//     return {
//       new_member_count,
//       expiring_member_count,
//       active_member_count,
//       membership_tiers,
//       membership_tier_counts,
//       membership_tier_expiring_member_count,
//     };
//   } catch (error) {
//     console.error('Error fetching dashboard info:', error);
//     throw error;
//   }
// }

// export default getDashboardInfo;