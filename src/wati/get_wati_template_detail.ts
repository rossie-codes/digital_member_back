// src/wati/get_wati_template_detail.ts

import { pool } from '../controllers/db'; // Adjusted import path
// import { CronJob } from 'cron';

import getWatiDetails from './wati_client';

// const WATI_TOKEN = process.env.WATI_TOKEN;
// const WATI_ENDPOINT = process.env.WATI_ENDPOINT;
// const url = `${WATI_ENDPOINT}/api/v1/getMessageTemplates?pageSize=200&pageNumber=1`;

export const getWatiTemplateDetail = async (): Promise<void> => {
  
  
  const watiDeatil = await getWatiDetails();

  console.log("WATI details is :", watiDeatil);


  const url = `${watiDeatil.wati_api_endpoint}/api/v1/getMessageTemplates?pageSize=200&pageNumber=1`;


  try {
    console.log('Fetching WATI template list from:', url);

    const response = await fetch(url, {
      headers: {
        // Authorization: `Bearer ${WATI_TOKEN}`,
        Authorization: `${watiDeatil.wati_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WATI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const template of data.messageTemplates) {
        const {
          id: template_uuid,
          elementName: element_name,
          category,
          status,
          lastModified,
          type: template_type,
          body,
          bodyOriginal: body_original,
          footer,
          buttonsType,
          header,
          customParams,
        } = template;

        // Parse and validate lastModified date
        const lastModifiedDate = new Date(lastModified);
        if (isNaN(lastModifiedDate.getTime())) {
          throw new Error(`Invalid date format for lastModified: ${lastModified}`);
        }

        const button_type = buttonsType !== 'none';
        const header_present = header?.type !== 0;

        const insertTemplateQuery = `
          INSERT INTO wati_template (
            template_uuid,
            element_name,
            category,
            wati_template_status,
            last_modified,
            template_type,
            body,
            body_original,
            footer,
            button_type,
            header_present,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          ON CONFLICT (template_uuid) DO UPDATE SET
            element_name = EXCLUDED.element_name,
            category = EXCLUDED.category,
            wati_template_status = EXCLUDED.wati_template_status,
            last_modified = EXCLUDED.last_modified,
            template_type = EXCLUDED.template_type,
            body = EXCLUDED.body,
            body_original = EXCLUDED.body_original,
            footer = EXCLUDED.footer,
            button_type = EXCLUDED.button_type,
            header_present = EXCLUDED.header_present,
            updated_at = NOW()
          RETURNING wati_template_id
        `;

        const templateValues = [
          template_uuid,
          element_name,
          category,
          status,
          lastModifiedDate,
          template_type,
          body,
          body_original,
          footer || null,
          button_type,
          header_present,
        ];

        const result = await client.query(insertTemplateQuery, templateValues);
        const wati_template_id = result.rows[0].wati_template_id;

        // Delete existing parameters for the template
        const deleteParamsQuery = `
          DELETE FROM wati_template_param
          WHERE wati_template_id = $1
        `;
        await client.query(deleteParamsQuery, [wati_template_id]);

        if (Array.isArray(customParams)) {
          for (const param of customParams) {
            const { paramName: param_name, paramValue: param_value } = param;

            const insertParamQuery = `
              INSERT INTO wati_template_param (
                wati_template_id,
                param_name,
                param_value,
                created_at,
                updated_at
              )
              VALUES ($1, $2, $3, NOW(), NOW())
            `;

            const paramValues = [wati_template_id, param_name, param_value];
            await client.query(insertParamQuery, paramValues);
          }
        }
      }

      await client.query('COMMIT');
      console.log('Successfully inserted WATI templates into database.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error inserting WATI templates into database:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in getWatiTemplateDetail:', error);
    throw error;
  }
};

// // Schedule the function to run every 5 minutes
// const job = new CronJob('*/10 * * * * *', async () => {
//   console.log('Running getWatiTemplateDetail at', new Date().toISOString());
//   try {
//     await getWatiTemplateDetail();
//   } catch (error) {
//     console.error('Error running getWatiTemplateDetail:', error);
//   }
// });

// Start the cron job
// job.start();