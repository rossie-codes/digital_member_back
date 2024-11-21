// src/controllers/report/dashboard/get_dashboard_info.ts

import { pool } from '../../db';

interface DashboardInfo {
  new_member_count: number;
  expiring_member_count: number;
  active_member_count: number;
  membership_tiers: string[];
  membership_tier_counts: { [membership_name: string]: number };
  membership_tier_expiring_member_count: { [membership_name: string]: number };
  membership_tier_upgrade_member_counts: { [membership_name: string]: number };
  membership_tier_change_percentage: { [membership_name: string]: number | null };
  upcoming_broadcasts: { broadcast_name: string; scheduled_start: string }[];
  active_discounts: { discount_code_name: string; valid_from: string }[];
}

async function getDashboardInfo(): Promise<DashboardInfo> {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let previousYear = currentYear;
    let previousMonth = currentMonth - 1;
    if (previousMonth < 1) {
      previousMonth = 12;
      previousYear -= 1;
    }

    // New members in current month
    const newMembersQuery = `
      SELECT COUNT(*) AS count
      FROM member
      WHERE EXTRACT(YEAR FROM created_at) = $1
        AND EXTRACT(MONTH FROM created_at) = $2
    `;
    const newMembersResult = await pool.query(newMembersQuery, [currentYear, currentMonth]);
    const new_member_count = parseInt(newMembersResult.rows[0].count, 10);

    // Members expiring in current month
    const expiringMembersQuery = `
      SELECT COUNT(*) AS count
      FROM member
      WHERE EXTRACT(YEAR FROM membership_expiry_date) = $1
        AND EXTRACT(MONTH FROM membership_expiry_date) = $2
    `;
    const expiringMembersResult = await pool.query(expiringMembersQuery, [currentYear, currentMonth]);
    const expiring_member_count = parseInt(expiringMembersResult.rows[0].count, 10);

    // Active members
    const activeMembersQuery = `
      SELECT COUNT(*) AS count
      FROM member
      WHERE membership_status = 'active'
    `;
    const activeMembersResult = await pool.query(activeMembersQuery);
    const active_member_count = parseInt(activeMembersResult.rows[0].count, 10);

    // Membership tiers
    const membershipTiersQuery = `
      SELECT membership_tier_id, membership_tier_name
      FROM membership_tier
      ORDER BY membership_tier_sequence
    `;
    const membershipTiersResult = await pool.query(membershipTiersQuery);
    const membership_tiers = membershipTiersResult.rows.map(row => row.membership_tier_name);

    // Initialize counts
    const membership_tier_counts: { [membership_name: string]: number } = {};
    const membership_tier_counts_previous: { [membership_name: string]: number } = {};
    const membership_tier_upgrade_member_counts: { [membership_name: string]: number } = {};
    const membership_tier_change_percentage: { [membership_name: string]: number | null } = {};
    const membership_tier_expiring_member_count: { [membership_name: string]: number } = {};

    membership_tiers.forEach(name => {
      membership_tier_counts[name] = 0;
      membership_tier_counts_previous[name] = 0;
      membership_tier_upgrade_member_counts[name] = 0;
      membership_tier_change_percentage[name] = null;
      membership_tier_expiring_member_count[name] = 0;
    });

    // Membership tier counts (current month)
    const tierCountsQuery = `
      SELECT mt.membership_tier_name, COUNT(*) as count
      FROM member m
      JOIN membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      WHERE m.membership_status = 'active'
      GROUP BY mt.membership_tier_name
    `;
    const tierCountsResult = await pool.query(tierCountsQuery);
    tierCountsResult.rows.forEach(row => {
      membership_tier_counts[row.membership_tier_name] = parseInt(row.count, 10);
    });

    // Membership tier counts (previous month)
    const tierCountsPreviousQuery = `
      SELECT mt.membership_tier_name, COUNT(*) as count
      FROM member m
      JOIN membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      WHERE m.membership_status = 'active'
        AND (
          (EXTRACT(YEAR FROM m.membership_start_date) < $1)
          OR (EXTRACT(YEAR FROM m.membership_start_date) = $1 AND EXTRACT(MONTH FROM m.membership_start_date) <= $2)
        )
        AND (
          m.membership_expiry_date IS NULL
          OR (EXTRACT(YEAR FROM m.membership_expiry_date) > $1)
          OR (EXTRACT(YEAR FROM m.membership_expiry_date) = $1 AND EXTRACT(MONTH FROM m.membership_expiry_date) >= $2)
        )
      GROUP BY mt.membership_tier_name
    `;
    const tierCountsPreviousResult = await pool.query(tierCountsPreviousQuery, [previousYear, previousMonth]);
    tierCountsPreviousResult.rows.forEach(row => {
      membership_tier_counts_previous[row.membership_tier_name] = parseInt(row.count, 10);
    });

    // Calculate membership_tier_change_percentage
    membership_tiers.forEach(name => {
      const currentCount = membership_tier_counts[name];
      const previousCount = membership_tier_counts_previous[name];
      if (previousCount === 0) {
        membership_tier_change_percentage[name] = null;
      } else {
        const change = ((currentCount - previousCount) / previousCount) * 100;
        membership_tier_change_percentage[name] = parseFloat(change.toFixed(2));
      }
    });

    // Membership tier upgrade member counts
    const tierUpgradeCountsQuery = `
      SELECT mt.membership_tier_name, COUNT(*) as count
      FROM member m
      JOIN membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      WHERE EXTRACT(YEAR FROM m.membership_start_date) = $1
        AND EXTRACT(MONTH FROM m.membership_start_date) = $2
      GROUP BY mt.membership_tier_name
    `;
    const tierUpgradeCountsResult = await pool.query(tierUpgradeCountsQuery, [currentYear, currentMonth]);
    tierUpgradeCountsResult.rows.forEach(row => {
      membership_tier_upgrade_member_counts[row.membership_tier_name] = parseInt(row.count, 10);
    });

    // Membership tier expiring member counts
    const tierExpiringCountsQuery = `
      SELECT mt.membership_tier_name, COUNT(*) as count
      FROM member m
      JOIN membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      WHERE EXTRACT(YEAR FROM m.membership_expiry_date) = $1
        AND EXTRACT(MONTH FROM m.membership_expiry_date) = $2
      GROUP BY mt.membership_tier_name
    `;
    const tierExpiringCountsResult = await pool.query(tierExpiringCountsQuery, [currentYear, currentMonth]);
    tierExpiringCountsResult.rows.forEach(row => {
      membership_tier_expiring_member_count[row.membership_tier_name] = parseInt(row.count, 10);
    });

    // Upcoming broadcasts
    const upcomingBroadcastsQuery = `
      SELECT broadcast_name, scheduled_start
      FROM broadcast
      WHERE scheduled_start > NOW()
      ORDER BY scheduled_start ASC
    `;
    const upcomingBroadcastsResult = await pool.query(upcomingBroadcastsQuery);
    const upcoming_broadcasts = upcomingBroadcastsResult.rows.map(row => ({
      broadcast_name: row.broadcast_name,
      scheduled_start: row.scheduled_start.toISOString(),
    }));

    // Active discounts
    const activeDiscountsQuery = `
      SELECT discount_code_name, valid_from
      FROM discount_code
      WHERE discount_code_status = 'active'
      ORDER BY valid_from ASC
    `;
    const activeDiscountsResult = await pool.query(activeDiscountsQuery);
    const active_discounts = activeDiscountsResult.rows.map(row => ({
      discount_code_name: row.discount_code_name,
      valid_from: row.valid_from.toISOString(),
    }));

    return {
      new_member_count,
      expiring_member_count,
      active_member_count,
      membership_tiers,
      membership_tier_counts,
      membership_tier_expiring_member_count,
      membership_tier_upgrade_member_counts,
      membership_tier_change_percentage,
      upcoming_broadcasts,
      active_discounts,
    };
  } catch (error) {
    console.error('Error fetching dashboard info:', error);
    throw error;
  }
}

export default getDashboardInfo;