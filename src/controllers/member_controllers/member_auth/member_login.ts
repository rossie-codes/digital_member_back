// src/controllers/member_controllers/member_auth/member_login.ts

import type { Context } from 'hono';
// import { pool } from '../../db';
import { getTenantClient, getTenantHostCustomer } from '../../db';
// import bcrypt from 'bcryptjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const MEMBI_CUSTOMER_SECRET = process.env.MEMBI_CUSTOMER_SECRET || 'MEMBI_CUSTOMER_SECRET'; // Replace with your secret key

async function loginMember(c: Context) {
  console.log('loginMember function begin')
  

  const app_domain = c.get('app_domain');
  const tenant_host = c.get("tenant_host");
  const customer_secret = c.get("customer_secret");

  // const tenantIdentifier = 'https://mm9_client'
  // const tenantIdentifier = 'https://membi-admin'

  console.log("tenant at login as tenant_host: ", tenant_host);
  console.log("tenant at login ad app_domain: ", app_domain);

  const pool = await getTenantClient(tenant_host);


  try {
    const { member_phone, member_password } = await c.req.json();

    if (!member_phone || !member_password) {
      return c.json({ error: 'Phone number and member_password are required' }, 400);
    }

    console.log('loginMember function begin, member_phone and password exist.')
    // Get the user from the database
    const result = await pool.query('SELECT * FROM member_login WHERE member_phone = $1', [member_phone]);

    if (result.rows.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

  
    const user = result.rows[0];

    console.log('loginMember function begin, member_phone exist in db.')

    // Compare the member_password
    // const isMatch = await bcrypt.compare(member_password, user.member_password_hash);
    const isMatch = await Bun.password.verify(member_password, user.member_password_hash);

    console.log('loginMember function begin, member_phone and password correct.')

    if (!isMatch) {
      // Optionally increment failed login attempts
      await pool.query(
        'UPDATE member_login SET failed_login_attempts = failed_login_attempts + 1 WHERE login_id = $1',
        [user.login_id]
      );

      return c.json({ error: 'Invalid credentials' }, 401);
    }
    

    console.log('loginCustomer function handle membi_m_token')
    // Generate a JWT membi_m_token

    // const customer_secret_domain = await getTenantHostCustomer(tenant_host)
    // console.log('loginCustomer function handle membi_m_token', customer_secret_domain)
    // const customer_secret = customer_secret_domain.customer_secret;


    // const membi_m_token = jwt.sign({ memberId: user.member_id }, MEMBI_CUSTOMER_SECRET, { expiresIn: '10h' });
    const membi_m_token = jwt.sign({ memberId: user.member_id }, customer_secret, { expiresIn: '10h' });

    // Update last_login and reset failed_login_attempts
    await pool.query(
      'UPDATE member_login SET last_login = NOW(), failed_login_attempts = 0 WHERE login_id = $1',
      [user.login_id]
    );

    // Set the membi_m_token as an HTTP-only cookie
    // const cookie = serialize('membi_m_token', membi_m_token, {
    //   httpOnly: true,
      // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    //   sameSite: 'strict',
    //   maxAge: 3600, // 1 hour
    //   path: '/',
    // });

    const cookie = serialize(`${tenant_host}_m_token`, membi_m_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax', // Change from 'strict' to 'lax'
      maxAge: 36000, // 10 hour
      // maxAge: 30, // 1 hour
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.up.railway.app' : undefined,
    });

    c.header('Set-Cookie', cookie);

    console.log('loginMember function done')
    
    return c.json({ message: 'Login successful' }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}


export default loginMember;