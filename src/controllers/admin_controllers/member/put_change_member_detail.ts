// src/controllers/member/put_change_member_detail.ts

// import { pool } from '../../db';
import { getTenantClient } from "../../db";
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

async function putChangeMemberDetail(c: Context): Promise<Response> {
  
  console.log('putChangeMemberDetail function begin');
  
  const tenant = c.get("tenant_host");
  // const tenant = 'https://mm9_client'
  // const tenant = 'https://membi-admin'

  console.log("tenant", tenant);

  const pool = await getTenantClient(tenant);


  try {
    // Extract memberPhone from the route parameters
    const memberPhone = c.req.param('memberPhone');
    if (!memberPhone) {
      throw new HTTPException(400, { message: 'Member phone is required' });
    }
    console.log('Received request to update member details for memberPhone:', memberPhone);

    // Parse the request body
    const body = await c.req.json();
    const { member_name, birthday } = body;

    // Validate input fields
    if (!member_name && !birthday) {
      throw new HTTPException(400, { message: 'At least one field (member_name or birthday) must be provided' });
    }

    // Prepare fields for update
    const fields = [];
    const values = [];
    let index = 1;

    if (member_name) {
      fields.push(`member_name = $${index++}`);
      values.push(member_name);
    }

    if (birthday) {
      fields.push(`birthday = $${index++}`);
      values.push(birthday);
    }

    if (fields.length === 0) {
      throw new HTTPException(400, { message: 'No valid fields provided for update' });
    }

    // Construct the UPDATE query
    const updateQuery = `
      UPDATE member
      SET ${fields.join(', ')}
      WHERE member_phone = $${index}
    `;
    values.push(memberPhone);

    // Execute the query
    const result = await pool.query(updateQuery, values);

    if (result.rowCount === 0) {
      throw new HTTPException(404, { message: 'Member not found' });
    }

    console.log('Member details updated for memberPhone:', memberPhone);
    return c.json({ message: 'Member details updated successfully' }, 200);
  } catch (error) {
    console.error('Error in putChangeMemberDetail:', error);
    if (error instanceof HTTPException) {
      throw error;
    } else {
      throw new HTTPException(500, { message: 'Internal Server Error' });
    }
  } finally {
    pool.release();
  } 
}

export default putChangeMemberDetail;