// src/routes/auth.ts

import { Hono } from 'hono';
import { loginAdmin } from '../../controllers/admin_controllers/auth/admin_login';
import { logoutAdmin } from '../../controllers/admin_controllers/auth/admin_logout';
import { signupAdmin } from '../../controllers/admin_controllers/auth/admin_signup';
import { checkAuth } from '../../controllers/admin_controllers/auth/check_auth';
import { adminLoginMiddleware } from '../../middleware/adminAuthMiddleware';

const adminAuthRouter = new Hono();

adminAuthRouter.post('/login', adminLoginMiddleware, loginAdmin);

adminAuthRouter.post('/logout', adminLoginMiddleware, logoutAdmin);

adminAuthRouter.post('/signup', adminLoginMiddleware, signupAdmin); // Signup route

// adminAuthRouter.get('/check', adminAuthMiddleware, checkAuth);

export default adminAuthRouter;