// src/shopify/get_shopify_order_list.ts

import type { Context } from 'hono';
import { graphqlClient } from './client'; // Import your Shopify GraphQL client
// import { GET_SHOPIFY_ORDER_LIST } from './get_shopify_order_list';


const GET_SHOPIFY_ORDER_LIST = `
  query orders($first: Int!, $after: String) {
    orders(first: $first, after: $after) {
        edges {
            node {
                id
                name
                createdAt
                totalPriceSet {
                    shopMoney {
                    amount
                    currencyCode
                    }
                }
                lineItems(first: 10) { # Adjust 'first' as needed
                    edges {
                    node {
                        title
                        quantity
                        variant {
                        id
                        title
                        price
                        }
                    }
                    }
                }
                # Add other fields as needed (e.g., customer, shippingAddress, etc.)
            }
        }
        pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
        }
    }
  }
`;


interface ShopifyOrder {
    id: string;
    name: string;
    createdAt: string;
    totalPriceSet: {
      shopMoney: {
        amount: string;
        currencyCode: string;
      };
    };
    lineItems: {
      edges: Array<{
        node: {
          title: string;
          quantity: number;
          variant: {
            id: string;
            title: string;
            price: string;
          };
        };
      }>;
    };
    // Add other fields as needed
  }
  
  interface ShopifyOrderResponse {
    data: {
      orders: {
        edges: Array<{ node: ShopifyOrder }>;
        pageInfo: {
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          endCursor: string | null;
        };
      };
    };
  }


async function getShopifyOrderList(c: Context): Promise<Response> {
  try {
    let allOrders: ShopifyOrder[] = [];
    let hasNextPage = true;
    let after: string | null = null;
    const first = 250; // Number of orders per page

    while (hasNextPage) {
      const result: any = await (graphqlClient).query<ShopifyOrderResponse>({
        data: {
          query: GET_SHOPIFY_ORDER_LIST,
          variables: {
            first: first,
            after: after,
          },
        },
      });

      if (result.body && result.body.data) {
        const orders = result.body.data.orders.edges.map((edge: any) => edge.node);
        allOrders = allOrders.concat(orders);

        hasNextPage = result.body.data.orders.pageInfo.hasNextPage;
        after = result.body.data.orders.pageInfo.endCursor;
      } else {
        console.error("Error: No data received from Shopify API. Check your query and credentials.");
        hasNextPage = false; // Stop pagination if no data is received
      }
    }
    console.log(allOrders)


    return c.json({ orders: allOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
}

export default getShopifyOrderList;