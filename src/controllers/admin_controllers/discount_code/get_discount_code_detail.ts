// src/controllers/discount_code/get_discount_code_detail.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import type { Context } from 'hono';

interface DiscountCode {
  discount_code_id: number;
  discount_code_name: string;
  discount_code: string;
  discount_type: 'fixed_amount' | 'percentage';
  discount_amount?: number;
  discount_percentage?: number;
  minimum_spending: number;
  fixed_discount_cap?: number;
  use_limit_type: 'single_use' | 'once_per_customer' | 'unlimited';
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
  discount_code_status: 'expired' | 'active' | 'suspended' | 'scheduled';
  discount_code_content: string;
  discount_code_term: string;
  // Remove 'is_active' since it no longer exists
}

async function getDiscountCodeDetail(c: Context): Promise<DiscountCode> {
  
  
  
  const discount_code_id = c.req.param('discount_code_id');

  console.log('discount_code_id is: ', discount_code_id);

  const tenant = c.get("tenant_host");
  // const tenant = 'https://mm9_client'
  // const tenant = 'https://membi-admin'

  console.log("tenant", tenant);

  const pool = await getTenantClient(tenant);
  
  try {
    // Query the database to get the specific discount code
    const query = `
      SELECT
        discount_code_id,
        discount_code_name,
        discount_code,
        discount_type,
        discount_amount,
        minimum_spending,
        fixed_discount_cap,
        use_limit_type,
        valid_from,
        valid_until,
        created_at,
        updated_at,
        discount_code_status,
        discount_code_content,
        discount_code_term
      FROM discount_code
      WHERE discount_code_id = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [discount_code_id]);

    if (rows.length === 0) {
      throw new Error('Discount code not found');
    }

    const row = rows[0];

    // Map fields based on discount_type
    let discountAmount: number | undefined = undefined;
    let discountPercentage: number | undefined = undefined;
    let fixedDiscountCap: number | undefined = undefined;

    if (row.discount_type === 'fixed_amount') {
      discountAmount = row.discount_amount !== null ? Number(row.discount_amount) : undefined;
    } else if (row.discount_type === 'percentage') {
      discountPercentage = row.discount_amount !== null ? Number(row.discount_amount) : undefined;
      fixedDiscountCap = row.fixed_discount_cap !== null ? Number(row.fixed_discount_cap) : undefined;
    }

    const discountCode: DiscountCode = {
      discount_code_id: row.discount_code_id,
      discount_code_name: row.discount_code_name,
      discount_code: row.discount_code,
      discount_type: row.discount_type,
      discount_amount: discountAmount,
      discount_percentage: discountPercentage,
      minimum_spending: row.minimum_spending !== null ? Number(row.minimum_spending) : 0,
      fixed_discount_cap: fixedDiscountCap,
      use_limit_type: row.use_limit_type,
      valid_from: row.valid_from ? row.valid_from.toISOString() : undefined,
      valid_until: row.valid_until ? row.valid_until.toISOString() : undefined,
      created_at: row.created_at ? row.created_at.toISOString() : '',
      updated_at: row.updated_at ? row.updated_at.toISOString() : '',
      discount_code_status: row.discount_code_status,
      discount_code_content: row.discount_code_content,
      discount_code_term: row.discount_code_term,
    };

    console.log('Discount code:', discountCode);
    // Return the discount code
    return discountCode;

  } catch (error) {
    console.error('Error fetching discount code:', error);
    throw error;
  } finally {
    pool.release();
  }
}

export default getDiscountCodeDetail;