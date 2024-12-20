// src/controllers/broadcast_setting/get_broadcast_list.ts

// import { pool } from "../../db";
import { getTenantClient } from "../../db";
import type { Context } from "hono";

// Define the response interface
interface GetBroadcastListResponse {
  data: any[];
  total_broadcast: number;
  total_recipient_count: number;
}
async function getBroadcastList(c: Context): Promise<GetBroadcastListResponse> {
  
  const tenant = c.get("tenant");
  console.log("tenant", tenant);
  const pool = await getTenantClient(tenant);
  
  try {

    console.log("getBroadcastList function begin");
    
    const pageParam = c.req.query("page");
    const pageSizeParam = c.req.query("pageSize");
    const sortFieldParam = c.req.query("sortField");
    const sortOrderParam = c.req.query("sortOrder");

    const searchText = c.req.query("searchText") || "";

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    // Allowed fields for sorting
    const allowedSortFields = ["scheduled_start", "recipient_count"];
    const sortFieldMapping: { [key: string]: string } = {
      scheduled_start: "b.scheduled_start",
      recipient_count: "recipient_count",
    };

    // Default sort field and mapped field
    const defaultSortField = "scheduled_start";
    const defaultMappedSortField = "b.scheduled_start";

    // Determine sort field
    let sortField: string;
    if (sortFieldParam && allowedSortFields.includes(sortFieldParam)) {
      sortField = sortFieldParam;
    } else {
      sortField = defaultSortField;
    }

    // Map the sort field to database column
    const mappedSortField =
      sortFieldMapping[sortField] || defaultMappedSortField;

    // Allowed sort orders
    const allowedSortOrders = ["ascend", "descend"];

    // Default sort order
    const defaultSortOrder = "ASC";

    // Determine sort order
    let sortOrder: string;
    if (sortOrderParam && allowedSortOrders.includes(sortOrderParam)) {
      sortOrder = sortOrderParam === "ascend" ? "ASC" : "DESC";
    } else {
      sortOrder = defaultSortOrder;
    }

    // Validate page and pageSize
    if (isNaN(page) || page < 1) {
      throw new Error("Invalid page number");
    }
    if (isNaN(pageSize) || pageSize < 1) {
      throw new Error("Invalid page size");
    }

    const offset = (page - 1) * pageSize;

    // Build the WHERE clauses
    const whereClauses: string[] = [];
    const queryParams: any[] = [];

    let paramIndex = 1;

    // Handle searchText for broadcast_name and wati_template
    if (searchText) {
      whereClauses.push(
        `(b.broadcast_name ILIKE $${paramIndex} OR b.wati_template ILIKE $${paramIndex})`
      );
      queryParams.push(`%${searchText}%`);
      paramIndex++;
    }

    // Filter broadcasts where scheduled_start is after the current time
    whereClauses.push(`b.scheduled_start > NOW()`);

    // Combine WHERE clauses
    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Get total count with filters
    const countQuery = `
      SELECT COUNT(*) FROM broadcast b
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams);
    const total_broadcast = parseInt(countResult.rows[0].count, 10);

    const orderByClause = `ORDER BY ${mappedSortField} ${sortOrder}`;

    // Data query with LIMIT and OFFSET
    const dataQuery = `
      SELECT
        b.broadcast_id,
        b.broadcast_name,
        b.wati_template,
        b.scheduled_start,
        COUNT(bh.broadcast_history_id) FILTER (WHERE bh.broadcast_history_status = 'pending') AS recipient_count
      FROM
        broadcast b
      LEFT JOIN
        broadcast_history bh ON b.broadcast_id = bh.broadcast_id
      ${whereClause}
      GROUP BY
        b.broadcast_id, b.broadcast_name, b.wati_template, b.scheduled_start
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Append LIMIT and OFFSET to queryParams
    queryParams.push(pageSize);
    queryParams.push(offset);
    paramIndex += 2;

    const dataResult = await pool.query(dataQuery, queryParams);
    const broadcasts = dataResult.rows;

    const data = broadcasts.map((row) => ({
      broadcast_id: row.broadcast_id,
      broadcast_name: row.broadcast_name,
      wati_template: row.wati_template,
      scheduled_start: row.scheduled_start,
      recipient_count: parseInt(row.recipient_count, 10),
    }));
    
    const total_recipient_count = data.map((row) => row.recipient_count).reduce((a, b) => a + b, 0);

    // Await the asynchronous function

    // Return the data with the correct watiTemplateList
    return {
      data: data,
      total_broadcast: total_broadcast,
      total_recipient_count: total_recipient_count,
    };
    
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Database query failed");
  } finally {
    pool.release();
  }
}

export default getBroadcastList;
