// 完成基本 啟用停用 discoount code

// // 重新啟用，要加返原先的 有效日期


// // src/shopify/put_shopify_discount_code_is_active.ts

// import { graphqlClient } from './client';

// const DEACTIVATE_DISCOUNT_CODE_MUTATION = `
//   mutation discountCodeDeactivate($id: ID!) {
//     discountCodeDeactivate(id: $id) {
//       codeDiscountNode {
//         id
//         codeDiscount {
//           ... on DiscountCodeBasic {
//             status
//           }
//         }
//       }
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;

// const ACTIVATE_DISCOUNT_CODE_MUTATION = `
//   mutation discountCodeActivate($id: ID!) {
//     discountCodeActivate(id: $id) {
//       codeDiscountNode {
//         id
//         codeDiscount {
//           ... on DiscountCodeBasic {
//             status
//           }
//         }
//       }
//       userErrors {
//         field
//         message
//       }
//     }
// }
// `;

// const UPDATE_DISCOUNT_CODE_MUTATION = `
//   mutation discountCodeBasicUpdate($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
//     discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
//       codeDiscountNode {
//         id
//         codeDiscount {
//           ... on DiscountCodeBasic {
//             startsAt
//             endsAt
//           }
//         }
//       }
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;


// // interface DiscountInput {
// //   discount_code_name: string;
// //   discount_code: string;
// //   discount_type: 'fixed_amount' | 'percentage';
// //   minimum_spending: number;
// //   use_limit_type: 'single_use' | 'once_per_customer' | 'unlimited';
// //   valid_from: string;
// //   valid_until: string;
// //   discount_amount?: number;
// //   discount_percentage?: number;
// //   // fixed_discount_cap?: number;
// //   is_active: boolean;
// // }

// async function putShopifyDiscountCodeIsActive(
//   shopify_discount_code_id: string,
//   is_active: boolean,
//   valid_from?: string,
//   valid_until?: string
// ): Promise<any> {

//   console.log('putShopifyDiscountCodeIsActive function start')

//   try {
//     const mutation = is_active ? ACTIVATE_DISCOUNT_CODE_MUTATION : DEACTIVATE_DISCOUNT_CODE_MUTATION;

//     const result: any = await graphqlClient.query({
//       data: {
//         'query': mutation,
//         'variables': {
//           'id': shopify_discount_code_id
//           ,
//         },
//       },
//     });


//     const responseData = is_active ? result.discountCodeActivate : result.discountCodeDeactivate;

//     if (responseData?.userErrors && responseData.userErrors.length > 0) {
//       const errors = responseData.userErrors.map((error: { message: string }) => error.message).join(', ');
//       throw new Error(`Shopify error: ${errors}`);
//     }

//     const updatedDiscount = responseData?.codeDiscountNode;
//     console.log('Updated Discount:', updatedDiscount);

//     return updatedDiscount;
//   } catch (error) {
//     console.error('Error updating Shopify discount code status:', error);
//     throw error;
//   }
// }

// export default putShopifyDiscountCodeIsActive;