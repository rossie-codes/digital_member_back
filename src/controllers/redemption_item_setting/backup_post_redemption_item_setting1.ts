// 完成基本新增功能

// 想加入       quantity_available: 0,
      // valid_from: values.valid_from,
      // valid_until: values.valid_until,
      // redemption_content: values.redemption_content,
      // redemption_term: values.redemption_term,


// // src/controllers/redemption_item_setting/post_redemption_item_setting.ts

// import { pool } from '../db';
// import { type Context } from 'hono';
// import { HTTPException } from 'hono/http-exception';

// async function postRedemptionItemSetting(c: Context): Promise<Response> {
//   try {
//     // Parse the request body
//     const body = await c.req.json();

//     // Extract common data from the payload
//     const {
//       redemption_item_name,
//       redemption_type,
//       minimum_spending,
//       validity_period,
//       is_active,
//       redeem_point,
//       discount_amount,
//       discount_percentage,
//       fixed_discount_cap,
//     } = body;

//     // Validate common required fields
//     if (
//       typeof redemption_item_name !== 'string' ||
//       !redemption_item_name.trim() ||
//       !['fixed_amount', 'percentage'].includes(redemption_type) ||
//       typeof minimum_spending !== 'number' ||
//       typeof validity_period !== 'number' ||
//       typeof is_active !== 'boolean' ||
//       typeof redeem_point !== 'number'
//     ) {
//       throw new HTTPException(400, { message: 'Invalid input data' });
//     }

//     // Calculate valid_from and valid_until
//     const validFromDate = new Date(); // Current date
//     const validUntilDate = new Date(validFromDate);
//     validUntilDate.setMonth(validUntilDate.getMonth() + validity_period);

//     // Determine redemption_item_status based on is_active and dates
//     let redemption_item_status: 'active' | 'expired' | 'suspended' | 'scheduled' = 'suspended';

//     if (is_active) {
//       const currentDate = new Date();

//       if (currentDate < validFromDate) {
//         redemption_item_status = 'scheduled';
//       } else if (currentDate >= validFromDate && currentDate <= validUntilDate) {
//         redemption_item_status = 'active';
//       } else if (currentDate > validUntilDate) {
//         redemption_item_status = 'expired';
//       }
//     }

//     // Prepare values common to both discount types
//     const redemptionItemName = redemption_item_name.trim();
//     const minSpending = parseFloat(minimum_spending.toFixed(2)); // Ensure two decimal places

//     // Initialize variables for fields that may or may not be present
//     let discountAmount: number | null = null;
//     let fixedDiscountCap: number | null = null;

//     // Validate and assign fields based on redemption_type
//     if (redemption_type === 'fixed_amount') {
//       if (typeof discount_amount !== 'number') {
//         throw new HTTPException(400, { message: 'Invalid or missing discount_amount for fixed_amount discount type' });
//       }
//       discountAmount = parseFloat(discount_amount.toFixed(2)); // Ensure two decimal places
//       fixedDiscountCap = null; // Not applicable for fixed_amount
//     } else if (redemption_type === 'percentage') {
//       if (
//         typeof discount_percentage !== 'number' ||
//         typeof fixed_discount_cap !== 'number'
//       ) {
//         throw new HTTPException(400, { message: 'Invalid or missing discount_percentage or fixed_discount_cap for percentage discount type' });
//       }
//       discountAmount = parseFloat(discount_percentage.toFixed(2)); // Store as discount_amount in database
//       fixedDiscountCap = parseFloat(fixed_discount_cap.toFixed(2));
//     }

//     // Optional fields (set to NULL or default values if not provided)
//     const quantity_available = null; // Set as needed

//     const insertQuery = `
//       INSERT INTO redemption_item (
//         redemption_item_name,
//         redemption_type,
//         discount_amount,
//         quantity_available,
//         minimum_spending,
//         fixed_discount_cap,
//         validity_period,
//         valid_from,
//         valid_until,
//         redeem_point,
//         redemption_item_status
//       ) VALUES (
//         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
//       ) RETURNING redemption_item_id
//     `;

//     const values = [
//       redemptionItemName,
//       redemption_type,
//       discountAmount,
//       quantity_available,
//       minSpending,
//       fixedDiscountCap,
//       validity_period,
//       validFromDate,
//       validUntilDate,
//       redeem_point,
//       redemption_item_status,
//     ];

//     // Get a database client from the pool
//     const client = await pool.connect();

//     try {
//       // Start a transaction
//       await client.query('BEGIN');

//       // Insert the data
//       const result = await client.query(insertQuery, values);

//       // Commit the transaction
//       await client.query('COMMIT');

//       // Return success response
//       return c.json(
//         {
//           message: 'Redemption item added successfully',
//           redemption_item_id: result.rows[0].redemption_item_id,
//         },
//         200
//       );
//     } catch (error) {
//       // Roll back the transaction in case of error
//       await client.query('ROLLBACK');
//       console.error('Error during transaction:', error);
//       throw new HTTPException(500, { message: 'Internal Server Error' });
//     } finally {
//       // Release the client back to the pool
//       client.release();
//     }
//   } catch (error) {
//     console.error('Error in postRedemptionItemSetting:', error);
//     if (error instanceof HTTPException) {
//       throw error;
//     }
//     throw new HTTPException(500, { message: 'Internal Server Error' });
//   }
// }

// export default postRedemptionItemSetting;