// src/wati/wati_client.ts

import { pool } from '../controllers/db';
import crypto from 'crypto';
// import watiApi from 'wati-api'; // Replace 'wati-api' with the actual module name

// Encryption key and algorithm
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key-here'; // Must be 32 characters
const IV_LENGTH = 16; // For AES, this is always 16 bytes

// Decryption function
function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

interface WatiDetail {
  wati_api_endpoint: string;
  wati_access_token: string;
}

async function getWatiDetails(): Promise<WatiDetail> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT wati_end_point, wati_access_token
      FROM admin_setting
      WHERE admin_setting_id = 1
    `;
    const result = await client.query(query);

    if (result.rows.length === 0) {
      throw new Error('WATI details not found');
    }

    const encryptedEndpoint = result.rows[0].wati_end_point;
    const encryptedToken = result.rows[0].wati_access_token;

    const wati_api_endpoint = decrypt(encryptedEndpoint);
    const wati_access_token = decrypt(encryptedToken);

    return { wati_api_endpoint, wati_access_token };
  } catch (error) {
    console.error('Error fetching WATI details:', error);
    throw error;
  } finally {
    client.release();
  }
}


export default getWatiDetails;

// let watiInstance: any;

// export async function getWatiApi() {
//   if (watiInstance) {
//     return watiInstance;
//   }

//   const watiDetails = await getWatiDetails();

//   watiInstance = watiApi({
//     baseURL: watiDetails.wati_api_endpoint,
//     accessToken: watiDetails.wati_access_token,
//   });

//   return watiInstance;
// }