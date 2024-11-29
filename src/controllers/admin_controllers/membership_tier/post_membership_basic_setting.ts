// src/controllers/membership_tier/post_membership_basic_setting.ts

import { pool } from '../../db';
import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception'


interface AdminSetting {
    admin_setting_id: number;
    membership_extend_method: number;
    membership_end_result: number;
    membership_period: number;
}

interface PostMembershipTierRequest {
    tiers: AdminSetting[];
}

// async function postAdminSetting() {
//     console.log('function begin')
// }

const BATCH_SIZE = 500; // Define an appropriate batch size based on your system's capacity

async function postMembershipBasicSetting(c: Context): Promise<{ message: string }> {
    console.log('post_admin_setting function begin')
    
    try {
        const setting: AdminSetting = await c.req.json();

        // Input validation (ensure all required fields are present)
        if (!setting || !setting.admin_setting_id || setting.membership_extend_method === undefined || setting.membership_end_result === undefined || setting.membership_period === undefined) {
            throw new HTTPException(400, { message: 'Invalid input: Missing required fields in admin setting.' });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            const upsertQuery = `
          INSERT INTO admin_setting 
            (admin_setting_id, membership_extend_method, membership_end_result, membership_period)
          VALUES 
            ($1, $2, $3, $4)
          ON CONFLICT (admin_setting_id) DO UPDATE SET
            membership_extend_method = EXCLUDED.membership_extend_method,
            membership_end_result = EXCLUDED.membership_end_result,
            membership_period = EXCLUDED.membership_period;
        `;

            await client.query(upsertQuery, [
                setting.admin_setting_id,
                setting.membership_extend_method,
                setting.membership_end_result,
                setting.membership_period,
            ]);

            await client.query('COMMIT');
            console.log('post_admin_setting function done')
            return { message: 'Admin setting upserted successfully.' };
        } catch (dbError) {
            await client.query('ROLLBACK');
            console.error('Database error:', dbError);
            throw new HTTPException(500, { message: 'Database error' }); // Or a more specific error message
        } finally {
            client.release();
        }

    } catch (error) {
        if (error instanceof HTTPException) {
            // If it's an HTTPException, re-throw it to be handled by Hono's error middleware
            throw error;
        } else {
            console.error('Unexpected error:', error);
            throw new HTTPException(500, { message: 'Internal Server Error' });
        }
    }
}


export default postMembershipBasicSetting;