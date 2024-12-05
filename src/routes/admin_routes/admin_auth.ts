// src/routes/auth.ts

import { Hono } from 'hono';
import { loginAdmin } from '../../controllers/admin_controllers/auth/admin_login';
import { logoutAdmin } from '../../controllers/admin_controllers/auth/admin_logout';
import { signupAdmin } from '../../controllers/admin_controllers/auth/admin_signup';
import { checkAuth } from '../../controllers/admin_controllers/auth/check_auth';
import { adminAuthMiddleware } from '../../middleware/adminAuthMiddleware';

const adminAuthRouter = new Hono();

adminAuthRouter.post('/login', loginAdmin);

adminAuthRouter.post('/logout', logoutAdmin);

adminAuthRouter.post('/signup', signupAdmin); // Signup route

// adminAuthRouter.get('/check', adminAuthMiddleware, checkAuth);

export default adminAuthRouter;