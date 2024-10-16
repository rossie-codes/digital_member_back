// src/routes/admin_setting/membership_tier_setting.ts

import getMembershipTierSetting from '../../controllers/membership_tier/get_membership_tier_setting';

// route/member.ts
export default async function memberSection(req: Request): Promise<Response> {
    
    const data = await getMembershipTierSetting()

    // console.log("Type of data:", typeof data);  // Should output 'object'
    console.log("Data is:", data);
    // console.log("data is: " + data[0].member_tel)
    
    return Response.json(data);  // Simplifies response creation

    // const result = JSON.stringify(data)
    
    // console.log(result)
    // return new Response((result), {  // Send the resolved data as JSON
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // });
}