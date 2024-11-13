// src/controllers/discount_code/get_deleted_discount_code_list.ts

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
    use_limit_type: '此編號使用一次後失效' | '每位客戶可使用一次' | '沒有限制';
    // use_limit_type: 'single_use' | 'once_per_customer' | 'unlimited';
    valid_from?: string;
    valid_until?: string;
    created_at: string;
    updated_at: string;
    discount_code_status: 'expired' | 'active' | 'suspended' | 'scheduled';
}

// Optional: Date formatting function
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0'); // Months are zero-based
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const useLimitTypeMap: { [key: number]: '此編號使用一次後失效' | '每位客戶可使用一次' | '沒有限制' } = {
    1: '此編號使用一次後失效',
    2: '每位客戶可使用一次',
    3: '沒有限制',
    // 1: 'single_use',
    // 2: 'once_per_customer',
    // 3: 'unlimited',
};

async function getDeletedDiscountCodeList(c: Context): Promise<DiscountCode[]> {
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
      WHERE deleted_status IS TRUE  -- Add this WHERE clause
      ORDER BY created_at DESC
    `;

    try {
        const { rows } = await pool.query(query);

        // Map the data to the DiscountCode interface
        const discountCodes: DiscountCode[] = rows.map((row, index) => {
            // Map 'discount_code_status' (boolean)
            const isActive = row.discount_code_status;

            // Depending on 'discount_type', map 'discount_amount' appropriately
            let discountAmount: number | undefined = undefined;
            let discountPercentage: number | undefined = undefined;
            let fixedDiscountCap: number | undefined = undefined;
            const useLimitType = useLimitTypeMap[row.use_limit_type] 

            if (row.discount_type === 'fixed_amount') {
                discountAmount = row.discount_amount !== null ? Number(row.discount_amount) : undefined;
            } else if (row.discount_type === 'percentage') {
                discountPercentage = row.discount_amount !== null ? Number(row.discount_amount) : undefined;
                fixedDiscountCap = row.fixed_discount_cap !== null ? Number(row.fixed_discount_cap) : undefined;
            }

            const discountCode: DiscountCode = {
                key: index + 1, // Assuming index as key
                discount_code_id: row.discount_code_id,
                discount_code_name: row.discount_code_name,
                discount_code: row.discount_code,
                discount_type: row.discount_type,
                discount_amount: discountAmount,
                discount_percentage: discountPercentage,
                minimum_spending: Number(row.minimum_spending),
                fixed_discount_cap: fixedDiscountCap,
                use_limit_type: useLimitType, // Use the mapped string value
                valid_from: row.valid_from ? formatDate(row.valid_from) : undefined,
                valid_until: row.valid_until ? formatDate(row.valid_until) : undefined,
                created_at: row.created_at ? formatDate(row.created_at) : '',
                updated_at: row.updated_at ? formatDate(row.updated_at) : '',
                discount_code_status: isActive,
            };

            return discountCode;
        });

        return discountCodes;
    } catch (error) {
        console.error('Error fetching discount codes:', error);
        throw error;
    }
}

export default getDeletedDiscountCodeList;