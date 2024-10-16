// 完成：取得 membership_tier 資料，返回 client side

// 在加入處理 membership setting 的 route 之前，想加入 hono 更好處理 routign
// 加入 middleware 框架

// index.ts

// import getMemberList from './src/routes/member'; // Adjust the path as needed
// import membershipTierSection from './src/routes/admin_setting/membership_tier'; // Adjust the path as needed
// import getMembershipTierSetting from './src/routes/admin_setting/membership_tier_setting'; // Adjust the path as needed
// import { Hono } from 'hono'

// import memberList from './src/controllers/member_list'

// const app = new Hono();

// // Error handling middleware
// app.onError((err, c) => {
//   console.error('Error occurred:', err);
//   return c.json({ error: 'Internal Server Error' }, 500);
// });

// // Example route that throws an error
// app.get('/error', () => {
//   throw new Error('Test error');
// });



// const server = Bun.serve({
//   port: 3000, // Or your preferred port
//   async fetch(req: Request) {
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