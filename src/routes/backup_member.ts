// 完成：舊 version 的 routing

// 想將 hono 應用，轉 routing 結構。

// // src/routes/member.ts

// import getMemberList from '../controllers/member/get_member_list'
// // import getMemberList from '../../controllers/member_list'

// export default async function memberSection(): Promise<Response> {
    
//     const data = await getMemberList()

//     // console.log("Type of data:", typeof data);  // Should output 'object'
//     // console.log("Data is:", data);
//     // console.log("data is: " + data[0].member_tel)
    
//     return Response.json(data);  // Simplifies response creation

//     // const result = JSON.stringify(data)
    
//     // console.log(result)
//     // return new Response((result), {  // Send the resolved data as JSON
//     //     headers: {
//     //         'Content-Type': 'application/json'
//     //     }
//     // });
// }


// // Or, if you need async operations:
// // export default async function step1(req: Request): Promise<Response> {
// //   const data = await someAsyncOperation();
// //   return new Response(`Step 1 data: ${data}`);
// // }



// // import basic_db from '../controllers/basic_db';

// // // route/member.js  (Better name than step1.js since it's the member route)
// // export default async function member(req: Request): Promise<Response> {
    
// //     const data = await basic_db(); // Call the basic_db function (presumably retrieves data)

// //     console.log("data is: " + data[0].member_tel); // Log the member_tel property of the first item in the data array
    
// //     // Convert the data to JSON and send it in the response
// //     return new Response(JSON.stringify(data), { 
// //       headers: {
// //         'Content-Type': 'application/json' // Important: set the correct content type
// //       }
// //     });
// // }