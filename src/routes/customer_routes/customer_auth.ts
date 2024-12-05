// src/routes/customer_routes/customer_auth.ts

import { Hono } from 'hono';
import loginMember from '../../controllers/member_controllers/member_auth/member_login';
import signupMember from '../../controllers/member_controllers/member_auth/member_signup';
import logoutMember from '../../controllers/member_controllers/member_auth/member_logout';
import checkAuth from '../../controllers/member_controllers/member_auth/check_auth';
import { memberAuthMiddleware } from '../../middleware/memberAuthMiddleware';

const customerAuthRouter = new Hono();

customerAuthRouter.post('/login', loginMember);

customerAuthRouter.post('/signup', signupMember); // Signup route

customerAuthRouter.post('/logout', logoutMember);

// customerAuthRouter.get('/check', memberAuthMiddleware, checkAuth);


export default customerAuthRouter;


// app.route('/customer/customer_auth', customerAuthRouter);