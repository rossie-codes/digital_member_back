// 完成：舊 version 的 routing

// 想將 hono 應用，轉 routing 結構。

// // src/routes/admin_setting/membership_tier.ts

// import setMembershipTier from '../../controllers/membership_tier/membership_tier';
// import { z } from 'zod';

// // Define the MembershipTier schema using Zod for validation
// const membershipTierSchema = z.object({
//   member_tier_name: z.string().min(1),
//   member_tier_sequence: z.number().int().positive(),
//   require_point: z.number().int().nonnegative(),
//   extend_membership_point: z.number().int().nonnegative(),
//   point_multiplier: z.number().positive(),
//   membership_period: z.number().int().positive(),
// });

// type MembershipTier = z.infer<typeof membershipTierSchema>;

// // Handler function
// export default async function membershipTierSection(req: Request): Promise<Response> {


//   try {
//     if (req.method !== 'POST') {
//       return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
//         status: 405,
//         headers: {
//           'Content-Type': 'application/json',
//           'Allow': 'POST',
//         },
//       });
//     }

//     // Parse the incoming JSON data
//     const rawTiers = await req.json();
//     console.log("rawTiers is:", rawTiers); // Use comma to log the object properly

//     // Verify that rawTiers is an array
//     if (!Array.isArray(rawTiers)) {
//       throw new Error("Invalid data format: expected an array of tiers");
//     }

//     // Validate each tier using Zod
//     const tiers: MembershipTier[] = rawTiers.map((tier, index) => {
//       try {
//         return membershipTierSchema.parse(tier);
//       } catch (error) {
//         if (error instanceof z.ZodError) {
//           console.error(`Validation error for tier at index ${index}:`, error.errors);
//           throw error;
//         } else {
//           throw new Error(`Invalid tier data at index ${index}: ${(error as Error).message}`);
//         }
//       }
//     });

//     console.log("Validated tiers:", tiers);

//     await setMembershipTier(tiers);

//     // Return a success response
//     return new Response(JSON.stringify({ message: "Membership tiers updated successfully!" }), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': 'http://localhost:3001',
//         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type',
//         'Access-Control-Allow-Credentials': 'true',
//       },
//     });
//   } catch (error) {
//     console.error("Error in membershipTierSection:", error);

//     // Determine if the error is a validation error
//     const isZodError = error instanceof z.ZodError;

//     if (isZodError) {
//       // Extract error details
//       const validationErrors = (error as z.ZodError).errors.map(err => ({
//         path: err.path,
//         message: err.message,
//       }));

//       return new Response(JSON.stringify({ message: "Validation Error", errors: validationErrors }), {
//         status: 400,
//         headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': 'http://localhost:3001',
//           'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//           'Access-Control-Allow-Headers': 'Content-Type',
//           'Access-Control-Allow-Credentials': 'true',
//         },
//       });
//     }

//     // For other types of errors, return a generic server error
//     return new Response(JSON.stringify({ message: "Internal Server Error" }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': 'http://localhost:3001',
//         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type',
//         'Access-Control-Allow-Credentials': 'true',
//       },
//     });
//   }
// }