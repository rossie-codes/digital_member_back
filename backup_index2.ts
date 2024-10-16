return 的 data 總是 [object Promise]
ChatGPT o1 解決了

// // import abc from './src/controllers/basic_db'
// // abc()

// import { BunFile } from 'bun';
// // Import route handlers
// import member from './src/routes/member'; // Assuming step1.js exports a handler function

// const server = Bun.serve({
//   port: 3000, // Or your preferred port
//   async fetch(req: Request) {
//     const url = new URL(req.url);

//     const CORS_HEADERS_ALL = {
//       headers: {
//         'Access-Control-Allow-Origin': 'http://localhost:3001',
//         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type',
//         'Access-Control-Allow-Credentials': 'true',
//       },
//     };

//     if (req.method === 'OPTIONS') {
//       const res = new Response('Departed', CORS_HEADERS_ALL);
//       return res;
//     }
    
//     if (url.pathname === '/') {
//       // Serve index.html (assuming you have a public directory)
//       try {
//         const indexFile = Bun.file('./public/index.html');
//         return new Response(indexFile, {
//           headers: {
//             'Content-Type': 'text/html',
//             ...CORS_HEADERS_ALL,
//           },
//         });
//       } catch (error) {
//         // Handle the case where index.html is not found
//         return new Response("index.html not found", { status: 404 });
//       }
//     } else if (url.pathname === '/member') {
//       // Call the member route handler
//       const memberResponse: Response = await member(req);
//       // return memberResponse;
//       return new Response(memberResponse, CORS_HEADERS_ALL);

//     } else {
//       throw new Error("member handler must return a Response or Promise<Response>");
//     }
  
//     return new Response("Not found", { status: 404 }); // Handle other 404s
//   }
// });

// console.log(`Listening on ${server.url}`);