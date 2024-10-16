// index.ts

import app from './app'

const server = Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000,
})

console.log(`Listening on ${server.url}`);


// route 分層跟 database table
// controller folder structure: 平面化一層過
// middleware 入簡單的 cors 全開 version
// index -> route -> controller and return and done
// Auth right, 放入 client side header, middlerware will check this header.


// const server = Bun.serve({
//   port: 3000, // Or your preferred port
//   async fetch(req: Request) {

// return app.request(req);


//     const url = new URL(req.url);

//     const CORS_HEADERS = {
//       'Access-Control-Allow-Origin': 'http://localhost:3001',
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type',
//       'Access-Control-Allow-Credentials': 'true',
//     };

//     if (req.method === 'OPTIONS') {
//       return new Response('Departed', {
//         headers: CORS_HEADERS,
//       });
//     }

//     if (url.pathname === '/member') {
//       // Record Start Time
//       const startTime = performance.now();
//       // Call the member route handler
//       // const memberResponse: Response = await memberList();
//       const memberResponse: Response = await getMemberList();
//       console.log(memberResponse)
//       // Record End Time
//       const endTime = performance.now();
//       // Calculate Duration
//       const duration = endTime - startTime; // Duration in milliseconds
//       // Log the Duration
//       console.log(`/member request processed in ${duration.toFixed(2)} ms`);
//       // Add CORS headers to the memberResponse
//       for (const [key, value] of Object.entries(CORS_HEADERS)) {
//         memberResponse.headers.set(key, value);
//       }
//       // console.log(memberResponse)
//       return memberResponse;

//     } else if (url.pathname === '/admin/membership_tier') {

//       const startTime = performance.now();
//       const membershipTierResponse: Response = await membershipTierSection(req);
//       // Record End Time
//       const endTime = performance.now();
//       // Calculate Duration
//       const duration: any = endTime - startTime; // Duration in milliseconds
//       // Log the Duration
//       console.log(`/admin/membership_tier request processed in ${duration.toFixed(2)} ms`);
//       // Add CORS headers to the memberResponse
//       for (const [key, value] of Object.entries(CORS_HEADERS)) {
//         membershipTierResponse.headers.set(key, value);
//       }
//       return membershipTierResponse;
//     } else if (url.pathname === '/admin/membership_tier_setting') {

//       const startTime = performance.now();
//       // Call the member route handler
//       const memberResponse: Response = await getMembershipTierSetting(req);
//       console.log(memberResponse)
//       // Record End Time
//       const endTime = performance.now();
//       // Calculate Duration
//       const duration = endTime - startTime; // Duration in milliseconds
//       // Log the Duration
//       console.log(`/member request processed in ${duration.toFixed(2)} ms`);
//       // Add CORS headers to the memberResponse
//       for (const [key, value] of Object.entries(CORS_HEADERS)) {
//         memberResponse.headers.set(key, value);
//       }
//       // console.log(memberResponse)
//       return memberResponse;
//     } else {
//       // Return 404 for other routes
//       return new Response("Not found", { status: 404 });
//     }
//   }
// });

// console.log(`Listening on ${server.url}`);