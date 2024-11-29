// 完成基本的 udpate

// 想更新 update 的項目，有些項目不容變動


// // src/controllers/redemption_item_setting/put_redemption_item_detail.ts

// import { pool } from '../db';
// import type { Context } from 'hono';
// import { HTTPException } from 'hono/http-exception';

// async function putRedemptionItemDetail(c: Context): Promise<Response> {
//     try {
//         // Get redemption_item_id from route parameters
//         const redemption_item_id_str = c.req.param('redemption_item_id');
//         const redemption_item_id = parseInt(redemption_item_id_str, 10);
//         if (isNaN(redemption_item_id)) {
//             throw new HTTPException(400, { message: 'Invalid redemption item ID' });
//         }

//         // Parse the request body
//         const body = await c.req.json();

//         const {
//             redemption_item_name,
//             discount_type,
//             minimum_spending,
//             validity_period
//         } = body;

//         if (
//             typeof redemption_item_name !== 'string' ||
//             !redemption_item_name.trim() ||
//             !['fixed_amount', 'percentage'].includes(discount_type) ||
//             typeof minimum_spending !== 'number' ||
//             minimum_spending < 0 ||
//             typeof validity_period !== 'number' ||
//             validity_period <= 0
//         ) {
//             throw new HTTPException(400, { message: 'Invalid or missing required fields' });

//         }


//         // Prepare variables for discount_amount and fixed_discount_cap
//         let discountAmount: number | null = null;
//         let fixedDiscountCap: number | null = null;

//         // Handle discount types
//         if (discount_type === 'fixed_amount') {
//             const { discount_amount } = body;

//             if (typeof discount_amount !== 'number' || discount_amount <= 0) {
//                 throw new HTTPException(400, { message: 'Invalid or missing discount_amount for fixed_amount discount type' });
//             }

//             discountAmount = parseFloat(discount_amount.toFixed(2));
//             fixedDiscountCap = null; // Not applicable
//         } else if (discount_type === 'percentage') {
//             const { discount_percentage, fixed_discount_cap } = body;

//             if (typeof discount_percentage !== 'number' || discount_percentage <= 0 || discount_percentage >= 100) {
//                 throw new HTTPException(400, { message: 'Invalid or missing discount_percentage for percentage discount type' });
//             }

//             discountAmount = parseFloat(discount_percentage.toFixed(2));

//             if (fixed_discount_cap !== undefined) {
//                 if (typeof fixed_discount_cap !== 'number' || fixed_discount_cap <= 0) {
//                     throw new HTTPException(400, { message: 'Invalid fixed_discount_cap for percentage discount type' });
//                 }
//                 fixedDiscountCap = parseFloat(fixed_discount_cap.toFixed(2));
//             } else {
//                 fixedDiscountCap = null;
//             }
//         }

//         // Calculate valid_from and valid_until
//         const valid_from = new Date();
//         const valid_until = new Date(valid_from);
//         valid_until.setMonth(valid_until.getMonth() + validity_period);

//         // Prepare values for updating
//         const redemptionItemName = redemption_item_name.trim();
//         const minSpending = parseFloat(minimum_spending.toFixed(2));

//         // Get a database client from the pool
//         const client = await pool.connect();

//         try {
//             // Start a transaction
//             await client.query('BEGIN');

//             // Prepare the SQL UPDATE statement
//             const updateQuery = `
//     UPDATE redemption_item
//     SET
//       redemption_item_name = $1,
//       discount_type = $2,
//       discount_amount = $3,
//       fixed_discount_cap = $4,
//       minimum_spending = $5,
//       validity_period = $6,
//       valid_from = $7,
//       valid_until = $8,
//       updated_at = NOW()
//     WHERE redemption_item_id = $9
//     RETURNING redemption_item_id
//   `;

//             const values = [
//                 redemptionItemName,
//                 discount_type,
//                 discountAmount,
//                 fixedDiscountCap,
//                 minSpending,
//                 validity_period,
//                 valid_from,
//                 valid_until,
//                 redemption_item_id
//             ];

//             const result = await client.query(updateQuery, values);

//             if (result.rowCount === 0) {
//                 // Redemption item not found
//                 await client.query('ROLLBACK');
//                 throw new HTTPException(404, { message: 'Redemption item not found' });
//             }

//             // Commit the transaction
//             await client.query('COMMIT');

//             // Return success response
//             return c.json(
//                 {
//                     message: 'Redemption item updated successfully',
//                     redemption_item_id: redemption_item_id
//                 },
//                 200
//             );
//         } catch (error) {
//             // Roll back the transaction in case of error
//             await client.query('ROLLBACK');
//             console.error('Error updating redemption item:', error);
//             throw new HTTPException(500, { message: 'Internal Server Error' });
//         } finally {
//             // Release the client back to the pool
//             client.release();
//         }


//         // Proceed to validate and update the redemption item...
//     } catch (error) {
//         console.error('Error in putRedemptionItemDetail:', error);
//         if (error instanceof HTTPException) {
//             throw error;
//         }
//         throw new HTTPException(500, { message: 'Internal Server Error' });
//     }
// }

// export default putRedemptionItemDetail;