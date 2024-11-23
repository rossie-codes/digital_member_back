// src/routes/customer_routes/customer_auth.ts

import { Hono } from 'hono';
import loginMember from '../../controllers/member_controllers/member_auth/member_login';
// import { logoutUser } from '../controllers/auth/logout';
import signupMember from '../../controllers/member_controllers/member_auth/member_signup';
import checkAuth from '../../controllers/member_controllers/member_auth/check_auth';

// import { checkAuth } from '../controllers/auth/check_auth';
import { memberAuthMiddleware } from '../../middleware/memberAuthMiddleware';


const customerAuthRouter = new Hono();

customerAuthRouter.post('/login', loginMember);
// authRouter.post('/logout', logoutUser);
customerAuthRouter.post('/signup', signupMember); // Signup route
// authRouter.get('/check', authMiddleware, checkAuth);

customerAuthRouter.get('/check', memberAuthMiddleware, checkAuth);


export default customerAuthRouter;


// app.route('/customer/customer_auth', customerAuthRouter);