// CORS problem, 剛剛解決，header 仍然分散


// import abc from './src/controllers/basic_db'
// abc()

// import { BunFile } from 'bun';
// // Import route handlers
// import member from './src/routes/member'; // Assuming step1.js exports a handler function

// const server = Bun.serve({
//   port: 3000, // Or your preferred port
//   fetch(req: Request) {
//     const url = new URL(req.url);

//     if (req.method === "OPTIONS") {
//       // Handle preflight requests for CORS
//       return new Response(null, {
//         headers: {
//           'Access-Control-Allow-Origin': 'http://localhost:3001', // Your Next.js frontend origin
//           'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//           'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//           'Access-Control-Allow-Credentials': 'true',
//         },
//       });
//     }


//     if (url.pathname === '/') {
//       // Serve index.html (assuming you have a public directory)
//       try {
//         const indexFile = Bun.file('./public/index.html');
//         return new Response(indexFile, {
//           headers: {
//             'Access-Control-Allow-Origin': 'http://localhost:3001', // Your Next.js frontend origin
//             'Access-Control-Allow-Methods': 'GET', // Only allow GET for static files
//           },
//         });
//       } catch (error) {
//         // Handle the case where index.html is not found
//         return new Response("index.html not found", { status: 404 });
//       }
//     } else if (url.pathname === '/member') {
//       // Call the member route handler
//       const memberResponse = member(req);

//       // Ensure memberResponse is a Response or Promise<Response>
//       if (memberResponse instanceof Response) {
//         // Add CORS headers to the member route response
//          memberResponse.headers.set('Access-Control-Allow-Origin', 'http://localhost:3001');
//          memberResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//          memberResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//          memberResponse.headers.set('Access-Control-Allow-Credentials', 'true');
//          return memberResponse;
//       } else if (memberResponse instanceof Promise) {

//         return memberResponse.then((response) => {
//           if (!(response instanceof Response)) {
//             throw new Error("member handler must return a Response or Promise<Response>");
//           }
//           // Add CORS headers to the resolved response
//           response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3001');
//           response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//           response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//           response.headers.set('Access-Control-Allow-Credentials', 'true');
//           return response;
//         });
//       } else {
//         throw new Error("member handler must return a Response or Promise<Response>");
//       }
//     }
//     return new Response("Not found", { status: 404 }); // Handle other 404s
//   },
// });

// console.log(`Listening on ${server.url}`);