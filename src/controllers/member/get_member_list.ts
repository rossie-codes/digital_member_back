// src/controllers/member/get_member_list.ts

import { pool } from '../db';
import { type Context } from 'hono';

interface Member {
  // ... your existing Member interface ...
}

async function getMemberList(c: Context): Promise<{ data: Member[]; total: number }> {
  try {
    const pageParam = c.req.query('page');
    const pageSizeParam = c.req.query('pageSize');
    const sortFieldParam = c.req.query('sortField');
    const sortOrderParam = c.req.query('sortOrder');

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    // Allowed fields for sorting
    const allowedSortFields = ['member_name', 'member_phone', 'point', 'membership_expiry_date'];
    const sortFieldMapping: { [key: string]: string } = {
      'member_name': 'm.member_name',
      'member_phone': 'm.member_phone',
      'point': 'm.point',
      'membership_expiry_date': 'm.membership_expiry_date',
      'member_id': 'm.member_id', // Default sorting field
    };

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

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM member');
    const total = parseInt(countResult.rows[0].count, 10);

    const orderByClause = `ORDER BY ${mappedSortField} ${sortOrder}`;

    // Query the database with LIMIT and OFFSET
    const query = `
      SELECT
        m.*,
        mt.member_tier_id AS mt_member_tier_id,
        mt.member_tier_name AS mt_member_tier_name,
        mt.member_tier_sequence,
        mt.require_point,
        mt.extend_membership_point,
        mt.point_multiplier,
        mt.membership_period
      FROM
        member m
      LEFT JOIN
        membership_tier mt ON m.member_tier_id = mt.member_tier_id
      ${orderByClause}
      LIMIT $1 OFFSET $2
    `;

    const data = await pool.query(query, [pageSize, offset]);

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
        point: row.point,
        member_tier_id: row.member_tier_id,
        membership_expiry_date: row.membership_expiry_date,
        referrer_member_id: row.referrer_member_id,
        birthday: row.birthday,
        is_active: row.is_active,
        member_note: row.member_note,
        member_tag: row.member_tag,
        state_code: row.state_code,
        membership_tier: row.mt_member_tier_id
        ? {
          member_tier_id: row.mt_member_tier_id,
          member_tier_name: row.mt_member_tier_name,
          member_tier_sequence: row.mt_member_tier_sequence,
          require_point: row.mt_require_point,
          extend_membership_point: row.mt_extend_membership_point,
          point_multiplier: row.mt_point_multiplier,
          membership_period: row.mt_membership_period,
        }
          : undefined,
      };
      return member;
    });

    return {
      data: members,
      total: total,
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed');
  }
}

export default getMemberList;