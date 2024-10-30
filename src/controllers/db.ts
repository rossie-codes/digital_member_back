// src/controllers/db.ts
import { Pool } from 'pg';  // 引入 pg 模組
import dotenv from 'dotenv';

dotenv.config(); // 確保環境變數從 .env 文件中正確讀取

// 使用 process.env 來取得 .env 中的配置
export const pool = new Pool({
  user: process.env.PG_USER, // 對應 .env 中的 PG_USER
  host: process.env.PG_HOST, // 對應 .env 中的 PG_HOST
  database: process.env.PG_DATABASE, // 對應 .env 中的 PG_DATABASE
  password: process.env.PG_PASSWORD,  // 對應 .env 中的 PG_PASSWORD
  port: parseInt(process.env.PG_PORT || '5432', 10), // 對應 .env 中的 PG_PORT，並確保轉換為整數
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,  // 如果需要 SSL（像是 Railway）
});

async function query(text: string, params?: any[]) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database error:', error);
    throw error; // Re-throw the error to be handled elsewhere
  }
}

export { query }; // 只導出 query，因為 pool 已經導出了
