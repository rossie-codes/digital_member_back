// src/config.ts

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;

if (!allowedOriginsEnv) {
  throw new Error('Environment variable ALLOWED_ORIGINS must be set.');
}

export const config = {
  allowedOrigins: allowedOriginsEnv.split(',').map(origin => origin.trim()),
  // Add other configuration variables here
};