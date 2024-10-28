// src/config.ts

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;



if (!allowedOriginsEnv) {
  throw new Error('Environment variable ALLOWED_ORIGINS must be set.');
}

// For development, you might want to log the parsed origins
const origins = allowedOriginsEnv.split(',').map(origin => origin.trim());

console.log('Configured allowed origins:', origins);


export const config = {
  allowedOrigins: origins,
  isDevelopment: process.env.NODE_ENV === 'development'
};