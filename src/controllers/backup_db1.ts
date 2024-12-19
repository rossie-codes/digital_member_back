// // src/controllers/db.ts


// import pg from 'pg';

// const pool = new pg.Pool({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//   port: parseInt(process.env.PG_PORT || "5432", 10), // Use parseInt to convert the port to a number
//   options: '-c search_path=mm9_client'

//   // Add SSL configuration if required by your database provider (e.g., Neon)
//   // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Important for Neon
// });

// async function query(text: string, params?: any[]) {
//   try {
//     const res = await pool.query(text, params);
//     return res;
//   } catch (error) {
//     console.error('Database error:', error);
//     throw error; // Re-throw the error to be handled elsewhere
//   }
// }

// export { query, pool }; // Export the query function and the pool