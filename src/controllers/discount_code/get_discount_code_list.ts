// src/controllers/discount_code/get_discount_code_list.ts

import { pool } from '../db';
import { type Context } from 'hono';

interface DiscountCode {
  key: number;
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
}

// Date formatting function
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0'); // Months are zero-based
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to get allowed enum values
async function getEnumValues(enumName: string): Promise<string[]> {
  const query = `
    SELECT enumlabel AS enum_value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = $1
    ORDER BY e.enumsortorder
  `;
  const { rows } = await pool.query(query, [enumName]);
  return rows.map((row) => row.enum_value);
}

async function getDiscountCodeList(): Promise<{

  discount_codes: DiscountCode[];
  discount_types: string[];
  use_limit_types: string[];
  discount_code_status: string[];
  active_count: number;
  scheduled_count: number;

}> {
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
      discount_code_status
    FROM discount_code
    WHERE deleted_status IS NOT TRUE
    ORDER BY created_at DESC
  `;

  try {
    const { rows } = await pool.query(query);

    let activeCount = 0;
    let scheduledCount = 0;


    // Map the data to the DiscountCode interface
    const discountCodes: DiscountCode[] = rows.map((row, index) => {
      // Map 'is_active' (boolean)

      // Depending on 'discount_type', map 'discount_amount' appropriately
      let discountAmount: number | undefined = undefined;
      let discountPercentage: number | undefined = undefined;
      let fixedDiscountCap: number | undefined = undefined;

      if (row.discount_type === 'fixed_amount') {
        discountAmount = row.discount_amount !== null ? Number(row.discount_amount) : undefined;
      } else if (row.discount_type === 'percentage') {
        discountPercentage = row.discount_amount !== null ? Number(row.discount_amount) : undefined;
        fixedDiscountCap = row.fixed_discount_cap !== null ? Number(row.fixed_discount_cap) : undefined;
      }


      // Increment counters based on discount_code_status
      if (row.discount_code_status === 'active') {
        activeCount++;
      } else if (row.discount_code_status === 'scheduled') {
        scheduledCount++;
      }


      const discountCode: DiscountCode = {
        key: index + 1,
        discount_code_id: row.discount_code_id,
        discount_code_name: row.discount_code_name,
        discount_code: row.discount_code,
        discount_type: row.discount_type,
        discount_amount: discountAmount,
        discount_percentage: discountPercentage,
        minimum_spending: Number(row.minimum_spending),
        fixed_discount_cap: fixedDiscountCap,
        use_limit_type: row.use_limit_type,
        valid_from: row.valid_from ? formatDate(new Date(row.valid_from)) : undefined,
        valid_until: row.valid_until ? formatDate(new Date(row.valid_until)) : undefined,
        created_at: row.created_at ? formatDate(new Date(row.created_at)) : '',
        updated_at: row.updated_at ? formatDate(new Date(row.updated_at)) : '',
        discount_code_status: row.discount_code_status,
      };

      return discountCode;
    });

    // Get allowed options from the database enums
    const discountTypes = await getEnumValues('discount_type_enum');
    const useLimitTypes = await getEnumValues('use_limit_enum');
    const statusOptions = await getEnumValues('discount_code_status_enum');

    // Since 'is_active' is boolean, options are true and false
    const isActiveOptions = [true, false];

    return {
      discount_codes: discountCodes,
      discount_types: discountTypes,
      use_limit_types: useLimitTypes,
      discount_code_status: statusOptions,
      active_count: activeCount,
      scheduled_count: scheduledCount,
    };
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    throw error;
  }
}

export default getDiscountCodeList;