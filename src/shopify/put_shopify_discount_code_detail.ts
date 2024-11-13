// src/shopify/put_shopify_discount_code_detail.ts

import { string } from 'zod';
import { graphqlClient } from './client';



const UPDATE_DISCOUNT_CODE_MUTATION = `
  mutation discountCodeBasicUpdate($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            startsAt
            endsAt
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

interface DiscountInput {
  shopify_discount_code_id: string;
  discount_type: 'fixed_amount' | 'percentage';
  discount_code_name: string;
  discount_amount: number;
  discount_percentage: number;
  use_limit_type: 'single_use' | 'once_per_customer' | 'unlimited';
  minimum_spending?: number;
  valid_from: string;
  valid_until: string;
}

// async function putShopifyDiscountCodeDetail(
//   shopify_discount_code_id: string,
//   discount_type: 'fixed_amount' | 'percentage',
//   discount_code_name: string,
//   discount_amount: number,
//   use_limit_type: 'single_use' | 'once_per_customer' | 'unlimited',
//   minimum_spending?: number,
//   valid_from?: string,
//   valid_until?: string
// ): Promise<any> {


async function putShopifyDiscountCodeDetail(input: DiscountInput): Promise<any> {
  console.log('putShopifyDiscountCodeDetail function start');

  // Accessing properties using dot notation (preferred when property names are known)
  const shopify_discount_code_id = input.shopify_discount_code_id;
  const discount_type = input.discount_type;
  const discount_amount = input.discount_amount;
  const discount_percentage = input.discount_percentage;
  const discount_code_name = input.discount_code_name;
  const use_limit_type = input.use_limit_type;
  const minimum_spending = input.minimum_spending; // Might be undefined if optional
  const valid_from = input.valid_from;
  const valid_until = input.valid_until;


  console.log('putShopifyDiscountCodeDetail function start');

  try {

    let discountValue: any

    if (discount_type === 'fixed_amount') {
      
      console.log('discount_amount: ', discount_amount);
      discountValue = {
        discountAmount: {
          amount: discount_amount.toString(),
          appliesOnEachItem: false, // Adjust as needed
        },
      };
    } else if (discount_type === 'percentage') {
      console.log('discount_amount: ', discount_amount);
      

      console.log('discount_percentage: ', discount_percentage);

      discountValue = {
        percentage: discount_percentage / 100, // Shopify expects a decimal between 0 and 1
      };
    } else {
      throw new Error(`Invalid discount_type: ${discount_type}`);
    }

    console.log('discountValue: ', discountValue);

    // Handle use_limit_type
    let appliesOncePerCustomer = false;
    let usageLimit: number | null = null;

    if (use_limit_type === 'single_use') {
      usageLimit = 1;
    } else if (use_limit_type === 'once_per_customer') {
      appliesOncePerCustomer = true;
    } else if (use_limit_type === 'unlimited') {
      // No special settings needed
    } else {
      throw new Error(`Invalid use_limit_type: ${use_limit_type}`);
    }



    // Build the basicCodeDiscount object
    const basicCodeDiscount: { [key: string]: any } = {
      title: discount_code_name,
      startsAt: valid_from,
      endsAt: valid_until,
      customerGets: {
        items: {
          all: true,
        },
        value: discountValue,
      },
      customerSelection: {
        all: true,
      },
    };

    if (minimum_spending && minimum_spending > 0) {
      basicCodeDiscount.minimumRequirement = {
        subtotal: {
          greaterThanOrEqualToSubtotal: minimum_spending.toString(),
        },
      };
    }

    if (appliesOncePerCustomer) {
      basicCodeDiscount.appliesOncePerCustomer = true;
    }

    if (usageLimit !== null) {
      basicCodeDiscount.usageLimit = usageLimit;
    }


    const updateResult: any = await graphqlClient.query({
      data: {
        query: UPDATE_DISCOUNT_CODE_MUTATION,
        variables: {
          id: shopify_discount_code_id,
          basicCodeDiscount: basicCodeDiscount,
        },
      }
    });


    const updateResponseData = updateResult.discountCodeBasicUpdate;

    if (updateResponseData?.userErrors && updateResponseData.userErrors.length > 0) {
      const errors = updateResponseData.userErrors
        .map((error: { message: string }) => error.message)
        .join(', ');
      throw new Error(`Shopify error during update: ${errors}`);
    }

    console.log('Updated Discount:', updateResponseData);

    return updateResponseData;
  } catch (error) {
    console.error('Error updating Shopify discount code detail:', error);
    throw error;
  }
}

export default putShopifyDiscountCodeDetail;
