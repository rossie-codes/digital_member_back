// src/routes/auth.ts

import { Hono } from 'hono';
import { loginUser } from '../../controllers/admin_controllers/auth/login';
import { logoutUser } from '../../controllers/admin_controllers/auth/logout';
import { signupAdmin } from '../../controllers/admin_controllers/auth/signup';
import { checkAuth } from '../../controllers/admin_controllers/auth/check_auth';
import { authMiddleware } from '../../middleware/authMiddleware';

const authRouter = new Hono();

authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.post('/signup', signupAdmin); // Signup route
authRouter.get('/check', authMiddleware, checkAuth);

export default authRouter;