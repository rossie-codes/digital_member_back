// // src/controllers/point_earning_record/post_point_earning_record.ts

// import { pool } from '../../db';
// import { type Context } from 'hono';
// import { HTTPException } from 'hono/http-exception';

// async function postPointEarningRecord(c: Context): Promise<Response> {
//   try {

//   } catch (error) {
//     console.error('Error in postPointEarningRecord:', error);
//     if (error instanceof HTTPException) {
//       throw error;
//     }
//     throw new HTTPException(500, { message: 'Internal Server Error' });
//   }
// }

// export default postPointEarningRecord;