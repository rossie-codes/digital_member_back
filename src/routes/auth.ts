// src/routes/auth.ts

import { Hono } from 'hono';
import { loginUser } from '../controllers/auth/login';
import { logoutUser } from '../controllers/auth/logout';
import { signupAdmin } from '../controllers/auth/signup';
import { checkAuth } from '../controllers/auth/check_auth';
import { authMiddleware } from '../middleware/authMiddleware';

const authRouter = new Hono();

authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.post('/signup', signupAdmin); // Signup route
authRouter.get('/check', authMiddleware, checkAuth);

export default authRouter;