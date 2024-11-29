// src/controllers/broadcast_setting/get_broadcast_member_list.ts

import { pool } from '../../db';
import type { Context } from 'hono';

// import { getWatiTemplateList } from "../../wati/get_wati_template_list";
import { getWatiTemplateDetail } from "../../../wati/get_wati_template_detail";

interface Member {
  member_id: number;
  created_at: string;
  created_by: number | null;
  updated_at: string;
  updated_by: number | null;
  member_phone: string;
  member_name: string;
  member_referral_code: string;
  points_balance: number;
  membership_tier_id: number | null;
  membership_expiry_date: string;
  referrer_member_id: number | null;
  birthday: string | null;
  membership_status: 'expired' | 'active' | 'suspended';
  member_note: string | null;
  member_tag: string[] | null; // Adjust type if necessary
  state_code: string | null;
  // Add a nested object to hold membership tier details
  membership_tier?: {
    membership_tier_id: number;
    membership_tier_name: string;
    membership_tier_sequence: number;
    require_point: number;
    extend_membership_point: number;
    point_multiplier: number;
    membership_period: number;
  };
  
}

async function getMemberList(c: Context): Promise<{
  data: Member[];
  total: number;
  membership_tiers: string[];
  membership_tier_counts: { [tier: string]: number };
  expiring_members_count: number;
  birthday_members_count: number;
  new_members_count: number;
  watiTemplateList: string[];
}> {
  // const aaa = await getShopifyOrderList(c)
  // console.log(aaa.json)

  
  try {
    const pageParam = c.req.query('page');
    const pageSizeParam = c.req.query('pageSize');
    const sortFieldParam = c.req.query('sortField');
    const sortOrderParam = c.req.query('sortOrder');
    const modalMemberSearchText = c.req.query('modalMemberSearchText') || '';


    const url = new URL(c.req.url, 'http://localhost'); // Base URL is required for relative URLs
    
    const membershipTierParams: string[] = url.searchParams.getAll('membership_tier') || [];
    const isActiveFilters: string[] = url.searchParams.getAll('membership_status');

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    // Allowed fields for sorting
    const allowedSortFields = ['member_name', 'member_phone', 'points_balance', 'membership_expiry_date', 'membership_tier'];
    const sortFieldMapping: { [key: string]: string } = {
      'member_name': 'm.member_name',
      'member_phone': 'm.member_phone',
      'points_balance': 'm.points_balance',
      'membership_expiry_date': 'm.membership_expiry_date',
      'membership_tier': 'mt.membership_tier_name',
      'member_id': 'm.member_id', // Default sorting field
    };


    const abcd = getWatiTemplateDetail()

    // Default sort field and mapped field
    const defaultSortField = 'member_id';
    const defaultMappedSortField = 'm.member_id';

    // Determine sort field
    let sortField: string;
    if (sortFieldParam && allowedSortFields.includes(sortFieldParam)) {
      sortField = sortFieldParam;
    } else {
      sortField = defaultSortField;
    }

    // Map the sort field to database column
    const mappedSortField = sortFieldMapping[sortField] || defaultMappedSortField;

    // Allowed sort orders
    const allowedSortOrders = ['ascend', 'descend'];

    // Default sort order
    const defaultSortOrder = 'ASC';

    // Determine sort order
    let sortOrder: string;
    if (sortOrderParam && allowedSortOrders.includes(sortOrderParam)) {
      sortOrder = sortOrderParam === 'ascend' ? 'ASC' : 'DESC';
    } else {
      sortOrder = defaultSortOrder;
    }

    // Validate page and pageSize
    if (isNaN(page) || page < 1) {
      throw new Error('Invalid page number');
    }
    if (isNaN(pageSize) || pageSize < 1) {
      throw new Error('Invalid page size');
    }

    const offset = (page - 1) * pageSize;

    // Build the WHERE clauses
    const whereClauses: string[] = [];
    const queryParams: any[] = [];

    let paramIndex = 1;

    // Handle modalMemberSearchText for member_name and member_phone
    if (modalMemberSearchText) {
      whereClauses.push(`(m.member_name ILIKE $${paramIndex} OR m.member_phone::text ILIKE $${paramIndex})`);
      queryParams.push(`%${modalMemberSearchText}%`);
      paramIndex++;
    }

    // Handle membership_tier filters
    if (membershipTierParams && membershipTierParams.length > 0) {
      const membershipTierPlaceholders = membershipTierParams.map((_, idx) => `$${paramIndex + idx}`).join(', ');
      whereClauses.push(`mt.membership_tier_name IN (${membershipTierPlaceholders})`);
      queryParams.push(...membershipTierParams);
      paramIndex += membershipTierParams.length;
    }

    // Handle membership_status filters
    if (isActiveFilters && isActiveFilters.length > 0) {
      const statusPlaceholders = isActiveFilters.map((_, idx) => `$${paramIndex + idx}`).join(', ');
      whereClauses.push(`m.membership_status IN (${statusPlaceholders})`);
      queryParams.push(...isActiveFilters);
      paramIndex += isActiveFilters.length;
    }

    // Combine WHERE clauses
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Get total count with filters
    const countQuery = `
      SELECT COUNT(*) FROM member m
      LEFT JOIN membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count, 10);

    const orderByClause = `ORDER BY ${mappedSortField} ${sortOrder}`;

    // Append LIMIT and OFFSET to queryParams
    queryParams.push(pageSize);
    paramIndex++;
    queryParams.push(offset);
    paramIndex++;

    // Data query with LIMIT and OFFSET
    const dataQuery = `
      SELECT
        m.*,
        mt.membership_tier_id AS mt_membership_tier_id,
        mt.membership_tier_name AS mt_membership_tier_name,
        mt.membership_tier_sequence,
        mt.require_point,
        mt.extend_membership_point,
        mt.point_multiplier,
        mt.membership_period
      FROM
        member m
      LEFT JOIN
        membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex - 2} OFFSET $${paramIndex - 1}
    `;

    const data = await pool.query(dataQuery, queryParams);

    const members = data.rows.map((row) => {
      // Create Member object
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
            membership_tier_name: row.mt_membership_tier_name,
            membership_tier_sequence: row.mt_membership_tier_sequence,
            require_point: row.mt_require_point,
            extend_membership_point: row.mt_extend_membership_point,
            point_multiplier: row.mt_point_multiplier,
            membership_period: row.mt_membership_period,
          }
          : undefined,
      };
      return member;
    });

    // Fetch all membership tiers
    const tiersQuery = `SELECT membership_tier_name FROM membership_tier`;
    const tiersResult = await pool.query(tiersQuery);
    const membershipTiers = tiersResult.rows.map(row => row.membership_tier_name);

    // **A. Count of Members in Different Membership Tiers**
    const tierCountsQuery = `
      SELECT
        COALESCE(mt.membership_tier_name, 'No Tier') AS membership_tier_name,
        COUNT(m.member_id) AS member_count
      FROM
        member m
      LEFT JOIN
        membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
      GROUP BY
        mt.membership_tier_name
      ORDER BY
        MAX(mt.membership_tier_sequence) -- Ensures correct ordering, handles NULL
    `;
    const tierCountsResult = await pool.query(tierCountsQuery);
    const membershipTierCounts: { [tier: string]: number } = {};
    tierCountsResult.rows.forEach(row => {
      membershipTierCounts[row.membership_tier_name || 'No Tier'] = parseInt(row.member_count, 10);
    });

    // **B. Count of Memberships Expiring in the Current Month**
    const expiringMembersQuery = `
      SELECT
        COUNT(*) AS expiring_members_count
      FROM
        member
      WHERE
        membership_expiry_date IS NOT NULL
        AND EXTRACT(YEAR FROM membership_expiry_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM membership_expiry_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    `;
    const expiringMembersResult = await pool.query(expiringMembersQuery);
    const expiringMembersCount = parseInt(expiringMembersResult.rows[0].expiring_members_count, 10);

    // **C. Count of Members with Birthdays in the Current Month**
    const birthdayMembersQuery = `
      SELECT
        COUNT(*) AS birthday_members_count
      FROM
        member
      WHERE
        birthday IS NOT NULL
        AND EXTRACT(MONTH FROM birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
    `;
    const birthdayMembersResult = await pool.query(birthdayMembersQuery);
    const birthdayMembersCount = parseInt(birthdayMembersResult.rows[0].birthday_members_count, 10);

    // **D. Count of Members Who Became Members in the Current Month**
    const newMembersQuery = `
      SELECT
        COUNT(*) AS new_members_count
      FROM
        member
      WHERE
        EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    `;
    const newMembersResult = await pool.query(newMembersQuery);
    const newMembersCount = parseInt(newMembersResult.rows[0].new_members_count, 10);

        // Fetch WATI template names
        const templateNamesQuery = `SELECT element_name FROM wati_template WHERE wati_template_status = 'APPROVED'`;
        const templateNamesResult = await pool.query(templateNamesQuery);
        const templateNames = templateNamesResult.rows.map(row => row.element_name);
    

    return {
      data: members,
      total: total,
      membership_tiers: membershipTiers,
      membership_tier_counts: membershipTierCounts,
      expiring_members_count: expiringMembersCount,
      birthday_members_count: birthdayMembersCount,
      new_members_count: newMembersCount,
      watiTemplateList: templateNames,
    };


  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed');
  }
}


export default getMemberList;
