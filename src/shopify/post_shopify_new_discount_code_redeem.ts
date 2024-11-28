// src/shopify/post_shopify_new_discount_code_redeem.ts

import { graphqlClient } from './client';

const CREATE_NEW_DISCOUNT_CODE_MUTATION = `
  mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            title
            codes(first: 1) {
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

const GET_EXISTING_DISCOUNT_CODES_QUERY = `
query codeDiscountNodeByCode($code: String!) {
  codeDiscountNodeByCode(code: $code) {
         codeDiscount {
      __typename
      ... on DiscountCodeBasic {
        codesCount {
          count
        }
        shortSummary
      }
    }
    id
  }
}
`;

interface DiscountInput {
  discount_code_name: string;
  discount_type: 'fixed_amount' | 'percentage';
  discount_amount?: number;
  discount_percentage?: number;
  minimum_spending: number;
  fixed_discount_cap?: number;
  use_limit_type: 'single_use';
  valid_from: string;
  valid_until: string;
}

async function createShopifyDiscountCodeRedeem(input: DiscountInput): Promise<{
  webstore_redeem_code_id: string;
  redeem_code: string;
  shop_id: string;
}> {
  try {
    let discountValue: any;

    if (input.discount_type === 'fixed_amount') {
      discountValue = {
        discountAmount: {
          amount: input.discount_amount!.toString(),
          appliesOnEachItem: false,
        },
      };
    } else {
      discountValue = {
        percentage: parseFloat((input.discount_percentage! / 100).toFixed(4)),
      };
    }

    const appliesOncePerCustomer = input.use_limit_type === 'single_use';
    const usageLimit = input.use_limit_type === 'single_use' ? 1 : null;

    const basicCodeDiscount: { [key: string]: any } = {
      title: input.discount_code_name,
      code: '',
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

    // Generate a unique redeem code
    let redeem_code = '';
    let codeExists = true;

    while (codeExists) {
      // Generate random 12-character code
      redeem_code = generateRandomCode(12);

      // let redeem_code = 'akdhfsdfjhkdsa';

      console.log('Generated code:', redeem_code);

      // Check if code exists in Shopify
      const checkResult: any = await graphqlClient.query({
        data: {
          query: GET_EXISTING_DISCOUNT_CODES_QUERY,
          variables: {
            code: redeem_code,
          },
        },
      });

      console.log('checkResult:', redeem_code);

      const existingCodes = checkResult.body.data.codeDiscountNodeByCode?.id;

      console.log('existingCodes:', existingCodes);

      codeExists = existingCodes ? existingCodes.length > 0 : false;

    }

    console.log('redeem_code is not exist');

    basicCodeDiscount.code = redeem_code;

    console.log('basicCodeDiscount.code:', redeem_code);

    console.log('basicCodeDiscount:', basicCodeDiscount);

    
    // Create discount code in Shopify
    const result: any = await graphqlClient.query({
      data: {
        query: CREATE_NEW_DISCOUNT_CODE_MUTATION,
        variables: {
          basicCodeDiscount: basicCodeDiscount,
        },
      },
    });

    const responseData = result.body.data?.discountCodeBasicCreate;

    if (responseData?.userErrors && responseData.userErrors.length > 0) {
      const errors = responseData.userErrors
        .map((error: { message: string }) => error.message)
        .join(', ');
      throw new Error(`Shopify error: ${errors}`);
    }

    const createdDiscount = responseData?.codeDiscountNode;
    const webstore_redeem_code_id = createdDiscount.id;
    const shop_id = ''; // Replace with your shop ID if needed

    return {
      webstore_redeem_code_id,
      redeem_code,
      shop_id,
    };
  } catch (error) {
    console.error('Error creating Shopify discount:', error);
    throw error;
  }
}

// Helper function to generate random code
function generateRandomCode(length: number): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default createShopifyDiscountCodeRedeem;