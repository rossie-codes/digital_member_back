// src/controllers/discount_code/post_new_discount_code.ts

import { pool } from '../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function postNewDiscountCode(c: Context): Promise<Response> {
    try {
        // Parse the request body
        const body = await c.req.json();

        // Extract common data
        const {
            discount_code_name,
            discount_code,
            discount_type,
            minimum_spending,
            use_limit_type,
            valid_from,
            valid_until,
            is_active
        } = body;

        // Validate common required fields
        if (
            typeof discount_code_name !== 'string' ||
            !discount_code_name.trim() ||
            typeof discount_code !== 'string' ||
            !discount_code.trim() ||
            !['fixed_amount', 'percentage'].includes(discount_type) ||
            typeof minimum_spending !== 'number' ||
            minimum_spending < 0 ||
            !['single_use', 'once_per_customer', 'unlimited'].includes(use_limit_type) ||
            typeof valid_from !== 'string' ||
            typeof valid_until !== 'string' ||
            typeof is_active !== 'boolean'
        ) {
            throw new HTTPException(400, { message: 'Invalid or missing required fields' });
        }

        // Parse valid_from and valid_until dates
        const validFromDate = new Date(valid_from);
        const validUntilDate = new Date(valid_until);

        if (isNaN(validFromDate.getTime()) || isNaN(validUntilDate.getTime())) {
            throw new HTTPException(400, { message: 'Invalid date format for valid_from or valid_until' });
        }

        // Ensure valid_until is after valid_from
        if (validUntilDate <= validFromDate) {
            throw new HTTPException(400, { message: 'valid_until must be after valid_from' });
        }

        // Map is_active to status
        const status = is_active ? 'active' : 'inactive';

        // Prepare variables for discount_amount and fixed_discount_cap
        let discountAmount: number | null = null;
        let fixedDiscountCap: number | null = null;

        // Handle discount types
        if (discount_type === 'fixed_amount') {
            const { discount_amount } = body;

            if (typeof discount_amount !== 'number' || discount_amount <= 0) {
                throw new HTTPException(400, { message: 'Invalid or missing discount_amount for fixed_amount discount type' });
            }

            discountAmount = parseFloat(discount_amount.toFixed(2));
            fixedDiscountCap = null; // Not applicable
        } else if (discount_type === 'percentage') {
            const { discount_percentage, fixed_discount_cap } = body;

            if (typeof discount_percentage !== 'number' || discount_percentage <= 0 || discount_percentage >= 100) {
                throw new HTTPException(400, { message: 'Invalid or missing discount_percentage for percentage discount type' });
            }

            discountAmount = parseFloat(discount_percentage.toFixed(2));

            if (fixed_discount_cap !== undefined) {
                if (typeof fixed_discount_cap !== 'number' || fixed_discount_cap <= 0) {
                    throw new HTTPException(400, { message: 'Invalid fixed_discount_cap for percentage discount type' });
                }
                fixedDiscountCap = parseFloat(fixed_discount_cap.toFixed(2));
            } else {
                fixedDiscountCap = null;
            }
        }

        // Prepare other values
        const discountCodeName = discount_code_name.trim();
        const discountCode = discount_code.trim();
        const minSpending = parseFloat(minimum_spending.toFixed(2));
        // (TypeScript example - easily adaptable to JavaScript)
        function getUseLimitType(use_limit_type: string): number | undefined {
            switch (use_limit_type) {
                case 'single_use':
                    return 1;
                case 'once_per_customer':
                    return 2;
                case 'unlimited':
                    return 3;
                default:
                    return undefined; // Or throw an error
            }
        }

        // ... inside your function ...
        const useLimitType = getUseLimitType(use_limit_type);

        if (useLimitType === undefined) {
            throw new HTTPException(400, { message: 'Invalid use_limit_type' });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const insertQuery = `
          INSERT INTO discount_code (
            discount_code_name,
            discount_code,
            discount_type,
            discount_amount,
            minimum_spending,
            fixed_discount_cap,
            use_limit_type,
            valid_from,
            valid_until,
            status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          ) RETURNING discount_code_id
        `;

            const values = [
                discountCodeName,
                discountCode,
                discount_type,
                discountAmount,
                minSpending,
                fixedDiscountCap,
                useLimitType,
                validFromDate,
                validUntilDate,
                status
            ];

            const result = await client.query(insertQuery, values);

            await client.query('COMMIT');

            return c.json(
                {
                    message: 'Discount code added successfully',
                    discount_code_id: result.rows[0].discount_code_id
                },
                200
            );
        } catch (error: any) {
            await client.query('ROLLBACK');

            if (error.code === '23505' && error.constraint === 'discount_code_discount_code_key') {
                throw new HTTPException(409, { message: 'Discount code already exists' });
            }

            console.error('Error inserting discount code:', error);
            throw new HTTPException(500, { message: 'Internal Server Error' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error in postNewDiscountCode:', error);
        if (error instanceof HTTPException) {
            throw error;
        }
        throw new HTTPException(500, { message: 'Internal Server Error' });
    }
}


export default postNewDiscountCode;