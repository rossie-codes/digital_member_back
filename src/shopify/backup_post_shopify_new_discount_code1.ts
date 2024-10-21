// 完成基本 code 但未成功試用

// 想轉成 o1 的解答


// // src/shopify/post_shopify_new_discount_code.ts

// import type { Context } from 'hono';
// import { graphqlClient } from './client';
// // import { GraphqlClient } from '@shopify/shopify-api/lib/clients/graphql';




// const CREATE_NEW_DISCOUNT_CODE = `
//   mutation createDiscount($input: DiscountAutomaticBasicInput!) {
//     discountAutomaticBasicCreate(automaticBasicDiscount: $input) {
//       automaticDiscountNode {
//         id
//         automaticDiscount {
//           ... on DiscountAutomaticBasic {
//             title
//             startsAt
//             endsAt
//             minimumRequirement {
//               ... on DiscountMinimumSubtotal {
//                 greaterThanOrEqualToSubtotal {
//                   amount
//                 }
//               }
//             }
//             customerGets {
//               value {
//                 ... on DiscountPercentage {
//                   percentage
//                 }
//                 ... on DiscountAmount {
//                   amount {
//                     amount
//                   }
//                 }
//               }
//             }
//             code
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

// interface DiscountInput {
//   discount_code_name: string;
//   discount_code: string;
//   discount_type: 'fixed_amount' | 'percentage';
//   minimum_spending: number;
//   use_limit_type: 'single_use' | 'once_per_customer' | 'unlimited';
//   valid_from: string;
//   valid_until: string;
//   discount_amount?: number;
//   discount_percentage?: number;
//   fixed_discount_cap?: number;
//   is_active: boolean;
// }

// interface ShopifyDiscountInput {
//   title: string;
//   code: string;
//   startsAt: string;
//   endsAt: string;
//   minimumRequirement: {
//     subtotal: {
//       greaterThanOrEqualToSubtotal: string;
//     };
//   };
//   customerGets: {
//     value: {
//       discountAmount?: { amount: string };
//       percentage?: number;
//     };
//     items?: {
//       all: boolean;
//     };
//   };
//   customerSelection: {
//     all: boolean;
//   };
//   usageLimit: number | null;
//   appliesOncePerCustomer: boolean;
// }

// interface ShopifyGraphQLResponse {
//   data?: {
//     discountAutomaticBasicCreate: {
//       automaticDiscountNode: {
//         id: string;
//         automaticDiscount: {
//           title: string;
//           startsAt: string;
//           endsAt: string;
//           minimumRequirement: {
//             greaterThanOrEqualToSubtotal: {
//               amount: string;
//             };
//           };
//           customerGets: {
//             value: {
//               percentage?: number;
//               amount?: {
//                 amount: string;
//               };
//             };
//           };
//           code: string;
//         };
//       };
//       userErrors: Array<{
//         field: string;
//         message: string;
//       }>;
//     };
//   };
//   errors?: Array<{
//     message: string;
//   }>;
// }




// async function postNewShopifyDiscountCode(c: Context): Promise<Response> {
//   try {
//     const input: DiscountInput = await c.req.json();

//     const discountInput: ShopifyDiscountInput = {
//       title: input.discount_code_name,
//       code: input.discount_code,
//       startsAt: input.valid_from,
//       endsAt: input.valid_until,
//       minimumRequirement: {
//         subtotal: {
//           greaterThanOrEqualToSubtotal: input.minimum_spending.toString()
//         }
//       },
//       customerGets: {
//         value: input.discount_type === 'fixed_amount'
//           ? { discountAmount: { amount: input.discount_amount!.toString() } }
//           : { percentage: input.discount_percentage! / 100 } // Shopify expects a decimal, e.g., 0.10 for 10%
//       },
//       customerSelection: {
//         all: true
//       },
//       usageLimit: input.use_limit_type === 'single_use' ? 1 : null,
//       appliesOncePerCustomer: input.use_limit_type === 'once_per_customer'
//     };

//     if (input.discount_type === 'percentage' && input.fixed_discount_cap) {
//       discountInput.customerGets.value = {
//         percentage: input.discount_percentage! / 100
//       };
//       discountInput.customerGets.items = {
//         all: true
//       };
//       // Note: fixed_discount_cap is not directly supported in this API call
//       // You might need to update the discount after creation to set this cap
//     }

//     const result = await graphqlClient.query<ShopifyGraphQLResponse>({
//       data: {
//         query: CREATE_NEW_DISCOUNT_CODE,
//         variables: {
//           input: discountInput
//         }
//       }
//     });

//     if (result.body?.errors && result.body.errors.length > 0) {
//       const errors = result.body.errors.map((error: { message: string }) => error.message).join(', ');
//       return c.json({ success: false, errors }, 400);
//     }

//     if (result.body?.data?.discountAutomaticBasicCreate.userErrors.length > 0) {
//       const errors = result.body.data.discountAutomaticBasicCreate.userErrors.map((error: { message: string }) => error.message).join(', ');
//       return c.json({ success: false, errors }, 400);
//     }

//     const createdDiscount = result.body?.data?.discountAutomaticBasicCreate.automaticDiscountNode.automaticDiscount;
//     return c.json({ success: true, discount: createdDiscount }, 201);

//   } catch (error: unknown) {
//     console.error('Error creating Shopify discount:', error);
//     return c.json({ success: false, error: 'Failed to create discount' }, 500);
//   }
// }

// export default postNewShopifyDiscountCode;