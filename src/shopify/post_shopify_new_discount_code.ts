// src/shopify/post_shopify_new_discount_code.ts

import { graphqlClient } from './client';

const CREATE_NEW_DISCOUNT_CODE_MUTATION = `
  mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            title
              codes(first: 10) {
                nodes {
                  code
                }
              }
            startsAt
            endsAt
            status
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;



// const CREATE_NEW_DISCOUNT_CODE_MUTATION = `
//   mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
//     discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
//       codeDiscountNode {
//         id
//       }
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;




// const CREATE_NEW_DISCOUNT_REDEEMCODE_MUTATION = `
// mutation discountRedeemCodeBulkAdd($discountId: ID!, $codes: [DiscountRedeemCodeInput!]!) {
//   discountRedeemCodeBulkAdd(discountId: $discountId, codes: $codes) {
//     bulkCreation {
//       id
//     }
//     userErrors {
//       code
//       field
//       message
//     }
//   }
// }
// `;


interface DiscountInput {
  discount_code_name: string;
  discount_code: string;
  discount_type: 'fixed_amount' | 'percentage';
  minimum_spending: number;
  use_limit_type: 'single_use' | 'once_per_customer' | 'unlimited';
  valid_from: string;
  valid_until: string;
  discount_amount?: number;
  discount_percentage?: number;
  // fixed_discount_cap?: number;
  is_active: boolean;
}

async function createShopifyDiscountCode(input: DiscountInput): Promise<any> {

  console.log('createShopifyDiscountCode function start')

  try {
    let discountValue: any;

    if (input.discount_type === 'fixed_amount') {
      discountValue = {
        discountAmount: {
          amount: input.discount_amount!.toString(),
          appliesOnEachItem: false, // or true, depending on your needs
        },
      };
    } else {
      discountValue = {
        percentage: input.discount_percentage! / 100, // Shopify expects a decimal between 0 and 1
      };
    }

    console.log('discountValue is: ', discountValue)
    // const appliesOncePerCustomer = input.use_limit_type === 'once_per_customer';
    const appliesOncePerCustomer = false;

    const usageLimit = input.use_limit_type === 'single_use' ? 1 : null;

    // Declare basicCodeDiscount as an object with index signatures to handle dynamic fields
    const basicCodeDiscount: { [key: string]: any } = {
      title: input.discount_code_name,
      code: input.discount_code,
      startsAt: input.valid_from,
      endsAt: input.valid_until || null,
      customerSelection: {
        all: true,
      },
      customerGets: {
        items: {
          all: true,
        },
        value: discountValue,
      },
      appliesOncePerCustomer: appliesOncePerCustomer,
      usageLimit: usageLimit,
    };



    if (input.minimum_spending && input.minimum_spending > 0) {
      basicCodeDiscount.minimumRequirement = {
        subtotal: {
          greaterThanOrEqualToSubtotal: input.minimum_spending.toString(),
        },
      };
    }

    // // Handle fixed discount cap for percentage discounts
    // if (input.discount_type === 'percentage' && input.fixed_discount_cap) {
    //   basicCodeDiscount.maximumDiscountAmount = {
    //     amount: input.fixed_discount_cap.toString(),
    //     currencyCode: 'HKD', // Adjust currency code as needed
    //   };
    // }

    console.log('createShopifyDiscountCode function start create basic code')
    console.log('createShopifyDiscountCode function start create basic code', basicCodeDiscount.code)
    console.log('createShopifyDiscountCode function start create basic code', basicCodeDiscount)



    
    const result: any = await graphqlClient.query({
      data: {
        'query': CREATE_NEW_DISCOUNT_CODE_MUTATION,
        'variables': {
          'basicCodeDiscount': basicCodeDiscount
          ,
        },
      },
    });

    console.log('createShopifyDiscountCode function done create basic code')

    // console.log(result)
    const webstore_discount_code_id = result.body.data.discountCodeBasicCreate.codeDiscountNode.id
    
    console.log('webstore discount code id: ', webstore_discount_code_id)



    // const discountRedeemCode: { [key: string]: any } = {
    //   discountId: webstore_discount_code_id,
    //   codes: input.discount_code
      
    // };

    // console.log('createShopifyDiscountCode function start add redeem code')

    // const redeemcode: any = await graphqlClient.query({
    //   data: {
    //     'query': CREATE_NEW_DISCOUNT_REDEEMCODE_MUTATION,
    //     'variables': {
    //       'basicCodeDiscount': discountRedeemCode
    //       ,
    //     },
    //   },
    // });

    // console.log('createShopifyDiscountCode function done redeem code')

    // console.log(redeemcode)



    const responseData = result.body.data?.discountCodeBasicCreate;

    if (responseData?.userErrors && responseData.userErrors.length > 0) {
      const errors = responseData.userErrors.map((error: { message: string }) => error.message).join(', ');
      throw new Error(`Shopify error: ${errors}`);
    }

    const createdDiscount = responseData?.codeDiscountNode
    console.log(createdDiscount)

    return createdDiscount;

  } catch (error) {
    console.error('Error creating Shopify discount:', error);
    throw error;
  }
}

export default createShopifyDiscountCode;