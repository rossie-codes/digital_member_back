// src/controllers/member/get_member_detail.ts

import { pool } from '../db';

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
  member_phone: string;
  member_name: string;
  purchase_count: number;
  total_purchase_amount: number;
}

interface MemberTier {
  membership_tier_id: number;
  membership_tier_name: string;
  membership_tier_sequence: number;
  require_point: number;
  extend_membership_point: number;
  point_multiplier: number;
  membership_period: number; // Or string if it can be a more complex representation
}

interface Member {
  member_id: number;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
  member_phone: string;
  member_name: string;
  member_referral_code: string | null; // Allow for null if no referral code
  point: number;
  membership_tier_id: number | null; // Allow for null if no tier assigned
  membership_expiry_date: string | null; // Allow for null if no expiry
  referrer_member_id: number | null; // Allow for null if no referrer
  birthday: string | null;  // Assuming date string or null
  is_active: boolean;
  member_note: string | null;
  member_tag: string | null;
  state_code: string | null;
  membership_tier: MemberTier | undefined;
  membership_start_date: string;
  membership_end_date: string;
  membership_creation_date: string;
  total_points_earned: number;
  unused_points: number;
  used_points: number;
  referrer: string | null; // Referral code of the referrer, not the ID
  referees: RefereeDataType[];
  purchase_count: number;
  total_purchase_amount: number;
  current_membership_purchase_amount: number;
  purchases: PurchaseDataType[];
  discount_codes: DiscountCodeType[];
}

async function getMemberDetail(memberPhone: string): Promise<Member> {
  try {
    const query = `
      SELECT
        m.*,
        mt.membership_tier_id AS mt_membership_tier_id,
        mt.membership_tier_name,
        mt.membership_tier_sequence,
        mt.require_point,
        mt.extend_membership_point,
        mt.point_multiplier,
        mt.membership_period
      FROM
        member m
      LEFT JOIN
        membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      WHERE
        m.member_phone = $1
    `;
    const { rows } = await pool.query(query, [memberPhone]);

    if (rows.length === 0) {
      throw new Error('Member not found');
    }

    const row = rows[0];

    const member: Member = {
      // Existing fields mapping...
      member_id: row.member_id,
      created_at: row.created_at,
      created_by: row.created_by,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      member_phone: row.member_phone,
      member_name: row.member_name,
      member_referral_code: row.member_referral_code,
      point: row.point,
      membership_tier_id: row.membership_tier_id,
      membership_expiry_date: row.membership_expiry_date,
      referrer_member_id: row.referrer_member_id,
      birthday: row.birthday,
      is_active: row.is_active,
      member_note: row.member_note,
      member_tag: row.member_tag,
      state_code: row.state_code,
      membership_tier: row.mt_membership_tier_id
        ? {
            membership_tier_id: row.mt_membership_tier_id,
            membership_tier_name: row.membership_tier_name,
            membership_tier_sequence: row.membership_tier_sequence,
            require_point: row.require_point,
            extend_membership_point: row.extend_membership_point,
            point_multiplier: row.point_multiplier,
            membership_period: row.membership_period,
          }
        : undefined,
      // Mock data
      membership_start_date: '2023-01-01',
      membership_end_date: '2023-12-31',
      membership_creation_date: "2023-01-01",
      total_points_earned: 200,
      unused_points: 150,
      used_points: 50,
      referrer: '98765432',
      referees: [
        {
          member_phone: '12345678',
          member_name: 'Referee 1',
          purchase_count: 5,
          total_purchase_amount: 500,
        },
        // Add more mock referees
      ],
      purchase_count: 10,
      total_purchase_amount: 1000,
      current_membership_purchase_amount: 800,
      purchases: [
        {
          purchase_id: '1',
          purchase_date: '2023-01-15',
          amount: 100,
        },
        {
          purchase_id: '2',
          purchase_date: '2023-02-20',
          amount: 150,
        },
        // Add more mock purchases
      ],
      discount_codes: [
        {
          code_id: '1',
          created_at: '2023-03-10',
          code_name: 'Spring Sale',
          code: 'SPRING2023',
          type: 'percentage',
          status: 'active',
          received_date: '2023-03-15',
          usage_count: 0,
        },
        // Add more mock discount codes
      ],
    };

    return member;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default getMemberDetail;