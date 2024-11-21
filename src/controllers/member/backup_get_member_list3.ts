// 完成：table sorter

// 想加入 membership_tier column selector

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

// async function getMemberList(c: Context): Promise<{ data: Member[]; total: number }> {
//   try {
//     const pageParam = c.req.query('page');
//     const pageSizeParam = c.req.query('pageSize');
//     const sortFieldParam = c.req.query('sortField');
//     const sortOrderParam = c.req.query('sortOrder');

//     const page = pageParam ? parseInt(pageParam, 10) : 1;
//     const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

//     // Allowed fields for sorting
//     const allowedSortFields = ['member_name', 'member_phone', 'point', 'membership_expiry_date'];
//     const sortFieldMapping: { [key: string]: string } = {
//       'member_name': 'm.member_name',
//       'member_phone': 'm.member_phone',
//       'point': 'm.point',
//       'membership_expiry_date': 'm.membership_expiry_date',
//       'member_id': 'm.member_id', // Default sorting field
//     };

//     // Default sort field and mapped field
//     const defaultSortField = 'member_id';
//     const defaultMappedSortField = 'm.member_id';

//     // Determine sort field
//     let sortField: string;
//     if (sortFieldParam && allowedSortFields.includes(sortFieldParam)) {
//       sortField = sortFieldParam;
//     } else {
//       sortField = defaultSortField;
//     }

//     // Map the sort field to database column
//     const mappedSortField = sortFieldMapping[sortField] || defaultMappedSortField;

//     // Allowed sort orders
//     const allowedSortOrders = ['ascend', 'descend'];

//     // Default sort order
//     const defaultSortOrder = 'ASC';

//     // Determine sort order
//     let sortOrder: string;
//     if (sortOrderParam && allowedSortOrders.includes(sortOrderParam)) {
//       sortOrder = sortOrderParam === 'ascend' ? 'ASC' : 'DESC';
//     } else {
//       sortOrder = defaultSortOrder;
//     }

//     // Validate page and pageSize
//     if (isNaN(page) || page < 1) {
//       throw new Error('Invalid page number');
//     }
//     if (isNaN(pageSize) || pageSize < 1) {
//       throw new Error('Invalid page size');
//     }

//     const offset = (page - 1) * pageSize;

//     // Get total count
//     const countResult = await pool.query('SELECT COUNT(*) FROM member');
//     const total = parseInt(countResult.rows[0].count, 10);

//     const orderByClause = `ORDER BY ${mappedSortField} ${sortOrder}`;

//     // Query the database with LIMIT and OFFSET
//     const query = `
//       SELECT
//         m.*,
//         mt.membership_tier_id AS mt_membership_tier_id,
//         mt.membership_tier_name AS mt_membership_tier_name,
//         mt.membership_tier_sequence,
//         mt.require_point,
//         mt.extend_membership_point,
//         mt.point_multiplier,
//         mt.membership_period
//       FROM
//         member m
//       LEFT JOIN
//         membership_tier mt ON m.membership_tier_id = mt.membership_tier_id
//       ${orderByClause}
//       LIMIT $1 OFFSET $2
//     `;

//     const data = await pool.query(query, [pageSize, offset]);

//     const members = data.rows.map((row) => {
//       // Create Member object
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
//         membership_tier: row.mt_membership_tier_id
//         ? {
//           membership_tier_id: row.mt_membership_tier_id,
//           membership_tier_name: row.mt_membership_tier_name,
//           membership_tier_sequence: row.mt_membership_tier_sequence,
//           require_point: row.mt_require_point,
//           extend_membership_point: row.mt_extend_membership_point,
//           point_multiplier: row.mt_point_multiplier,
//           membership_period: row.mt_membership_period,
//         }
//           : undefined,
//       };
//       return member;
//     });

//     return {
//       data: members,
//       total: total,
//     };
//   } catch (error) {
//     console.error('Database query error:', error);
//     throw new Error('Database query failed');
//   }
// }

// export default getMemberList;

