// src/shopify/client.ts

import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';


const shopDomain = process.env.SHOPIFY_ID;
const accessToken = process.env.SHOPIFY_TOKEN; // This should be your Admin API access token

if (!shopDomain) {
  throw new Error('SHOPIFY_ID is not set in the environment variables');
}

if (!accessToken) {
  throw new Error('SHOPIFY_TOKEN (Admin API access token) is not set in the environment variables');
}



export const shopify = shopifyApi({
  
  apiSecretKey: process.env.SHOPIFY_SECRET!,
  apiVersion: LATEST_API_VERSION,
  isCustomStoreApp: true,
  adminApiAccessToken: "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",
  // scopes: ['write_price_rules'], // Add other scopes as needed
  hostName: shopDomain,

  isEmbeddedApp: false,

  apiKey: process.env.SHOPIFY_KEY!,
});
// 教整 admin custom app
//https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-api/docs/guides/custom-store-app.md


// Create a session with the access token
export const session = shopify.session.customAppSession(shopDomain);

// Create a GraphQL client with the session that includes the access token
export const graphqlClient = new shopify.clients.Graphql({ session });





// export const shopify = shopifyApi({
//   apiKey: process.env.SHOPIFY_KEY!,
//   apiSecretKey: process.env.SHOPIFY_SECRET!,
//   adminApiAccessToken: accessToken,
//   scopes: ['write_price_rules'], // Add other scopes as needed
//   hostName: shopDomain,
//   apiVersion: LATEST_API_VERSION,
//   isEmbeddedApp: false,
// });
