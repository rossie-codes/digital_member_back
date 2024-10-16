import { pool } from '../db';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function putDiscountCodeDetail(c: Context): Promise<Response> {
  try {
    // Get discount_code_id from route parameters
    const discount_code_id_str = c.req.param('discount_code_id');
    const discount_code_id = parseInt(discount_code_id_str, 10);
    if (isNaN(discount_code_id)) {
      throw new HTTPException(400, { message: 'Invalid Discount Code ID' });
    }

    // Parse the request body
    const body = await c.req.json();

    const {
      discount_code_name,
      discount_code,
      discount_type,
      minimum_spending,
      valid_from,
      valid_until
    } = body;

    if (
      typeof discount_code_name !== 'string' ||
      !discount_code_name.trim() ||
      typeof discount_code !== 'string' ||
      !discount_code.trim() ||
      !['fixed_amount', 'percentage'].includes(discount_type) ||
      typeof minimum_spending !== 'number' ||
      minimum_spending < 0
    ) {
      throw new HTTPException(400, { message: 'Invalid or missing required fields' });
    }

    // Validate valid_from and valid_until
    let validFromDate: Date | null = null;
    let validUntilDate: Date | null = null;

    if (valid_from !== null && valid_from !== undefined) {
      validFromDate = new Date(valid_from);
      if (isNaN(validFromDate.getTime())) {
        throw new HTTPException(400, { message: 'Invalid valid_from date' });
      }
    }

    if (valid_until !== null && valid_until !== undefined) {
      validUntilDate = new Date(valid_until);
      if (isNaN(validUntilDate.getTime())) {
        throw new HTTPException(400, { message: 'Invalid valid_until date' });
      }
    }

    if (validFromDate && validUntilDate && validUntilDate <= validFromDate) {
      throw new HTTPException(400, { message: 'valid_until must be after valid_from' });
    }

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

    // Prepare values for updating
    const discountCodeName = discount_code_name.trim();
    const discountCode = discount_code.trim();
    const minSpending = parseFloat(minimum_spending.toFixed(2));

    // Get a database client from the pool
    const client = await pool.connect();

    try {
      // Start a transaction
      await client.query('BEGIN');

      // Prepare the SQL UPDATE statement
      const updateQuery = `
        UPDATE discount_code
        SET
          discount_code_name = $1,
          discount_code = $2,
          discount_type = $3,
          discount_amount = $4,
          fixed_discount_cap = $5,
          minimum_spending = $6,
          valid_from = $7,
          valid_until = $8,
          updated_at = NOW()
        WHERE discount_code_id = $9
        RETURNING discount_code_id
      `;

      const values = [
        discountCodeName,
        discountCode,
        discount_type,
        discountAmount,
        fixedDiscountCap,
        minSpending,
        validFromDate,
        validUntilDate,
        discount_code_id
      ];

      const result = await client.query(updateQuery, values);

      if (result.rowCount === 0) {
        // Discount Code not found
        await client.query('ROLLBACK');
        throw new HTTPException(404, { message: 'Discount Code not found' });
      }

      // Commit the transaction
      await client.query('COMMIT');

      // Return success response
      return c.json(
        {
          message: 'Discount Code updated successfully',
          discount_code_id: discount_code_id
        },
        200
      );
    } catch (error: any) {
      // Roll back the transaction in case of error
      await client.query('ROLLBACK');
      console.error('Error updating Discount Code:', error);
      if (error.code === '23505' && error.constraint === 'discount_code_discount_code_key') {
        throw new HTTPException(409, { message: 'Discount code already exists' });
      }
      throw new HTTPException(500, { message: 'Internal Server Error' });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error in putDiscountCodeDetail:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}

export default putDiscountCodeDetail;