// src/shopify/put_shopify_discount_code_is_active.ts

import { graphqlClient } from './client';

const DEACTIVATE_DISCOUNT_CODE_MUTATION = `
  mutation discountCodeDeactivate($id: ID!) {
    discountCodeDeactivate(id: $id) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
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

const ACTIVATE_DISCOUNT_CODE_MUTATION = `
  mutation discountCodeActivate($id: ID!) {
    discountCodeActivate(id: $id) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
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

async function putShopifyDiscountCodeIsActive(
  shopify_discount_code_id: string,
  is_active: boolean,
  valid_from?: string,
  valid_until?: string
): Promise<any> {
  console.log('putShopifyDiscountCodeIsActive function start');

  try {
    if (is_active) {
      // Reactivate the discount code

      // first, activate the discount code
      const activateResult: any = await graphqlClient.query({
        data: {
          query: ACTIVATE_DISCOUNT_CODE_MUTATION,
          variables: {
            id: shopify_discount_code_id,
          },
        }
      });

      const activateResponseData = activateResult.discountCodeActivate;

      if (activateResponseData?.userErrors && activateResponseData.userErrors.length > 0) {
        const errors = activateResponseData.userErrors.map((error: { message: string }) => error.message).join(', ');
        throw new Error(`Shopify error during activation: ${errors}`);
      }


      const updatedDiscount = activateResponseData?.codeDiscountNode;
      console.log('Reactivated Discount:', updatedDiscount);

      // then, update the startsAt and endsAt

      console.log('putShopifyDiscountCodeIsActive function start');
      console.log('start', valid_from);
      console.log('end', valid_until);

      const updateResult: any = await graphqlClient.query({
        data: {
          query: UPDATE_DISCOUNT_CODE_MUTATION,
          variables: {
            id: shopify_discount_code_id,
            basicCodeDiscount: {
              startsAt: valid_from,
              endsAt: valid_until,
            },
          },
        }
      });

      const updateResponseData = updateResult.discountCodeBasicUpdate;

      if (updateResponseData?.userErrors && updateResponseData.userErrors.length > 0) {
        const errors = updateResponseData.userErrors.map((error: { message: string }) => error.message).join(', ');
        throw new Error(`Shopify error during update: ${errors}`);
      }




      return updatedDiscount;

    } else {
      // Deactivate the discount code
      const result: any = await graphqlClient.query({
        data: {
          query: DEACTIVATE_DISCOUNT_CODE_MUTATION,
          variables: {
            id: shopify_discount_code_id,
          },
        }
      });

      const responseData = result.discountCodeDeactivate;

      if (responseData?.userErrors && responseData.userErrors.length > 0) {
        const errors = responseData.userErrors.map((error: { message: string }) => error.message).join(', ');
        throw new Error(`Shopify error during deactivation: ${errors}`);
      }

      const updatedDiscount = responseData?.codeDiscountNode;
      console.log('Deactivated Discount:', updatedDiscount);

      return updatedDiscount;
    }

  } catch (error) {
    console.error('Error updating Shopify discount code status:', error);
    throw error;
  }
}

export default putShopifyDiscountCodeIsActive;