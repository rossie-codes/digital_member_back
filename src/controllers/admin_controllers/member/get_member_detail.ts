// src/controllers/member/get_member_detail.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import type { Context } from "hono";


interface PurchaseDataType {
  purchase_id: string;
  purchase_date: string;
  amount: number;
}

interface DiscountCodeType {
  code_id: string;
  created_at: string;
  code_name: string;
  code: string;
  type: string;
  status: string;
  received_date: string;
  usage_count: number;
}

interface RefereeDataType {
  created_at: string;
  member_phone: string;
  member_name: string;
  purchase_count: number;
  total_purchase_amount: number;
}

interface MembershipTier {
  membership_tier_id: number;
  membership_tier_name: string;
  membership_tier_sequence: number;
  require_point: number;
  extend_membership_point: number;
  point_multiplier: number;
  membership_period: number;
}

interface Member {
  member_id: number;
  created_at: string;
  created_by: number | null;
  updated_at: string;
  updated_by: number | null;
  member_phone: string;
  member_name: string;
  member_referral_code: string | null;
  points_balance: number;
  membership_tier_id: number | null;
  membership_expiry_date: string | null;
  referrer_member_id: number | null;
  birthday: string | null;
  membership_status: "expired" | "active" | "suspended";
  member_note: string | null;
  member_tag: string | null;
  state_code: string | null;
  membership_tier: MembershipTier | undefined;
  membership_start_date: string;
  membership_end_date: string | null;
  membership_creation_date: string;
  total_points_earned: number;
  unused_points: number;
  used_points: number;
  referrer: string | null;
  referees: RefereeDataType[];
  purchase_count: number;
  total_purchase_amount: number;
  current_membership_purchase_amount: number;
  purchases: PurchaseDataType[];
  discount_codes: DiscountCodeType[];
}

async function getMemberDetail(c: Context): Promise<Member> {
  const memberPhone = c.req.param("memberPhone");

  console.log("memberPhone is: ", memberPhone);

  const tenant = c.get("tenant_host");
  // const tenant = 'https://mm9_client'
  // const tenant = 'https://membi-admin'

  console.log("tenant", tenant);

  const pool = await getTenantClient(tenant);

  try {
    // Fetch basic member information
    const memberQuery = `
      SELECT
        m.*,
        mt.membership_tier_id AS mt_membership_tier_id,
        mt.membership_tier_name,
        mt.membership_tier_sequence,
        mt.require_point,
        mt.extend_membership_point,
        mt.point_multiplier,
        mt.membership_period,
        m.membership_status
      FROM
        member m
      LEFT JOIN
        membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      WHERE
        m.member_phone = $1
    `;
    const { rows } = await pool.query(memberQuery, [memberPhone]);

    if (rows.length === 0) {
      throw new Error("Member not found");
    }

    const row = rows[0];
    const memberId = row.member_id;

    // Membership dates
    const membership_start_date = row.created_at;
    const membership_end_date = row.membership_expiry_date;
    const membership_creation_date = row.created_at;

    // Points Statistics
    const totalPointsEarnedQuery = `
      SELECT COALESCE(SUM(point_earning), 0) AS total_points_earned
      FROM point_earning_record
      WHERE member_id = $1
    `;
    const totalPointsResult = await pool.query(totalPointsEarnedQuery, [
      memberId,
    ]);
    const total_points_earned =
      parseInt(totalPointsResult.rows[0].total_points_earned, 10) || 0;

    const usedPointsQuery = `
      SELECT COALESCE(SUM(redeem_point), 0) AS used_points
      FROM redemption_record
      WHERE member_id = $1
    `;
    const usedPointsResult = await pool.query(usedPointsQuery, [memberId]);
    const used_points = parseInt(usedPointsResult.rows[0].used_points, 10) || 0;

    const unused_points = total_points_earned - used_points;

    // Purchase Statistics
    const purchaseStatsQuery = `
      SELECT 
        COUNT(*) AS purchase_count,
        COALESCE(SUM(total_price), 0) AS total_purchase_amount
      FROM member_order
      WHERE customer_phone = $1
    `;
    const purchaseStatsResult = await pool.query(purchaseStatsQuery, [
      memberPhone,
    ]);
    const purchase_count =
      parseInt(purchaseStatsResult.rows[0].purchase_count, 10) || 0;
    const total_purchase_amount =
      parseFloat(purchaseStatsResult.rows[0].total_purchase_amount) || 0;

    const currentMembershipPurchaseQuery = `
      SELECT 
        COALESCE(SUM(total_price), 0) AS current_membership_purchase_amount
      FROM member_order
      WHERE
        customer_phone = $1
        AND order_created_date BETWEEN $2 AND $3
    `;
    const currentMembershipPurchaseResult = await pool.query(
      currentMembershipPurchaseQuery,
      [memberPhone, membership_start_date, membership_end_date]
    );
    const current_membership_purchase_amount =
      parseFloat(
        currentMembershipPurchaseResult.rows[0]
          .current_membership_purchase_amount
      ) || 0;

    // Purchases
    const purchasesQuery = `
      SELECT
        order_id AS purchase_id,
        order_created_date AS purchase_date,
        total_price AS amount
      FROM member_order
      WHERE
        customer_phone = $1
      ORDER BY order_created_date DESC
    `;
    const purchasesResult = await pool.query(purchasesQuery, [memberPhone]);

    const purchases = purchasesResult.rows.map((purchase) => ({
      purchase_id: purchase.purchase_id.toString(),
      purchase_date: purchase.purchase_date,
      amount: parseFloat(purchase.amount),
    }));

    // Referrer
    let referrer: string | null = null;
    if (row.referrer_member_id) {
      const referrerQuery = `
        SELECT member_phone
        FROM member
        WHERE member_id = $1
      `;
      const referrerResult = await pool.query(referrerQuery, [
        row.referrer_member_id,
      ]);
      if (referrerResult.rows.length > 0) {
        referrer = referrerResult.rows[0].member_phone;
      }
    }

    // Referees
    const refereesQuery = `
      SELECT
        m.created_at,
        m.member_id,
        m.member_name,
        m.member_phone,
        m.created_at,
        COUNT(o.order_id) AS purchase_count,
        COALESCE(SUM(o.total_price), 0) AS total_purchase_amount
      FROM
        member m
      LEFT JOIN member_order o ON o.customer_phone = m.member_phone
      WHERE
        m.referrer_member_id = $1
      GROUP BY
        m.member_id, m.member_name, m.member_phone, m.created_at
    `;
    const refereesResult = await pool.query(refereesQuery, [memberId]);

    const referees = refereesResult.rows.map((referee) => ({
      created_at: referee.created_at,
      member_phone: referee.member_phone,
      member_name: referee.member_name,
      purchase_count: parseInt(referee.purchase_count, 10) || 0,
      total_purchase_amount: parseFloat(referee.total_purchase_amount) || 0,
    }));

    // Discount Codes
    const discountCodesQuery = `
      SELECT
        rr.redemption_record_id AS code_id,
        rr.received_date,
        ri.redemption_item_name AS code_name,
        rr.redeem_code AS code,
        ri.redemption_type AS type,
        ri.redemption_item_status AS status,
        rr.received_date,
        COALESCE(COUNT(od.order_discount_id), 0) AS usage_count
      FROM redemption_record rr
      JOIN redemption_item ri ON rr.redemption_item_id = ri.redemption_item_id
      LEFT JOIN order_discounts od ON od.discount_code = rr.redeem_code
      WHERE rr.member_id = $1
      GROUP BY rr.redemption_record_id, ri.redemption_item_name, rr.redeem_code, ri.redemption_type, ri.redemption_item_status, rr.received_date
    `;

    const discountCodesResult = await pool.query(discountCodesQuery, [
      memberId,
    ]);

    const discount_codes = discountCodesResult.rows.map((code) => ({
      code_id: code.code_id.toString(),
      created_at: code.received_date,
      code_name: code.code_name,
      code: code.code,
      type: code.type,
      status: code.status ? "active" : "inactive",
      received_date: code.received_date,
      usage_count: parseInt(code.usage_count, 10) || 0,
    }));

    // Assemble the member object
    const member: Member = {
      member_id: row.member_id,
      created_at: row.created_at,
      created_by: row.created_by,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      member_phone: row.member_phone,
      member_name: row.member_name,
      member_referral_code: row.member_referral_code,
      points_balance: row.points_balance,
      membership_tier_id: row.membership_tier_id,
      membership_expiry_date: row.membership_expiry_date,
      referrer_member_id: row.referrer_member_id,
      birthday: row.birthday,
      membership_status: row.membership_status,
      member_note: row.member_note,
      member_tag: row.member_tag,
      state_code: row.state_code,
      membership_tier: row.mt_membership_tier_id
        ? {
            membership_tier_id: row.mt_membership_tier_id,
            membership_tier_name: row.membership_tier_name,
            membership_tier_sequence: row.mt_membership_tier_sequence,
            require_point: row.require_point,
            extend_membership_point: row.extend_membership_point,
            point_multiplier: row.point_multiplier,
            membership_period: row.membership_period,
          }
        : undefined,
      membership_start_date: membership_start_date,
      membership_end_date: membership_end_date,
      membership_creation_date: membership_creation_date,
      total_points_earned: total_points_earned,
      unused_points: unused_points,
      used_points: used_points,
      referrer: referrer,
      referees: referees,
      purchase_count: purchase_count,
      total_purchase_amount: total_purchase_amount,
      current_membership_purchase_amount: current_membership_purchase_amount,
      purchases: purchases,
      discount_codes: discount_codes,
    };

    return member;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    pool.release();
  }
}

export default getMemberDetail;
