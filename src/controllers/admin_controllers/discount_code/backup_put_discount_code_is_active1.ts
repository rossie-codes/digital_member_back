// 完成基本 isactive 更改，但要轉用新方法

// 想轉用新方法

// // src/controllers/discount_code/put_discount_code_is_active.ts

// import { pool } from '../db';
// import type { Context } from 'hono';
// import { HTTPException } from 'hono/http-exception';
// import putShopifyDiscountCodeIsActive from '../../shopify/put_shopify_discount_code_is_active';

// async function putDiscountCodeIsActive(c: Context): Promise<Response> {
//   try {
//     const discount_code_id_str = c.req.param('discount_code_id');
//     const discount_code_id = parseInt(discount_code_id_str, 10);
//     if (isNaN(discount_code_id)) {
//       throw new HTTPException(400, { message: 'Invalid discount code ID' });
//     }

//     const body = await c.req.json();
//     const { is_active } = body;

//     if (typeof is_active !== 'boolean') {
//       throw new HTTPException(400, { message: 'Invalid input: is_active must be a boolean' });
//     }

//     const client = await pool.connect();

//     try {
//       await client.query('BEGIN');

//       const selectQuery = `
//         SELECT webstore_discount_code_id, valid_from, valid_until
//         FROM discount_code
//         WHERE discount_code_id = $1
//       `;
//       const selectResult = await client.query(selectQuery, [discount_code_id]);

//       if (selectResult.rowCount === 0) {
//         throw new HTTPException(404, { message: 'Discount code not found' });
//       }

//       const { webstore_discount_code_id, valid_from, valid_until } = selectResult.rows[0];

//       if (!webstore_discount_code_id) {
//         throw new HTTPException(400, {
//           message: 'No Shopify discount code ID associated with this discount code',
//         });
//       }

//       let isActiveEnumValue = 'suspended';

//       if (is_active) {
//         const currentDate = new Date();

//         if (currentDate < valid_from) {
//           isActiveEnumValue = 'scheduled';
//         } else if (currentDate >= valid_from && currentDate <= valid_until) {
//           isActiveEnumValue = 'active';
//         } else if (currentDate > valid_until) {
//           isActiveEnumValue = 'expired';
//         }

//         try {
//           await putShopifyDiscountCodeIsActive(
//             webstore_discount_code_id,
//             true,
//             valid_from.toISOString(),
//             valid_until.toISOString()
//           );
//         } catch {
//           throw new HTTPException(500, {
//             message: 'Failed to update discount code status in Shopify',
//           });
//         }
//       } else {
//         isActiveEnumValue = 'suspended';

//         try {
//           await putShopifyDiscountCodeIsActive(webstore_discount_code_id, false);
//         } catch {
//           throw new HTTPException(500, {
//             message: 'Failed to update discount code status in Shopify',
//           });
//         }
//       }

//       const updateQuery = `
//         UPDATE discount_code
//         SET is_active = $1, updated_at = NOW()
//         WHERE discount_code_id = $2
//         RETURNING discount_code_id
//       `;
//       const values = [isActiveEnumValue, discount_code_id];

//       const result = await client.query(updateQuery, values);

//       if (result.rowCount === 0) {
//         throw new HTTPException(404, { message: 'Discount code not found on update' });
//       }

//       await client.query('COMMIT');

//       return c.json(
//         { message: 'Discount code status updated successfully', discount_code_id },
//         200
//       );
//     } catch (error) {
//       await client.query('ROLLBACK');
//       if (error instanceof HTTPException) {
//         throw error;
//       }
//       throw new HTTPException(500, { message: 'Internal Server Error' });
//     } finally {
//       client.release();
//     }
//   } catch (error) {
//     if (error instanceof HTTPException) {
//       throw error;
//     }
//     throw new HTTPException(500, { message: 'Internal Server Error' });
//   }
// }

// export default putDiscountCodeIsActive;