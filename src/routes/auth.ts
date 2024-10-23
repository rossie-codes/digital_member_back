import { Hono } from 'hono';
import { registerUser } from '../controllers/auth/register';
import { loginUser } from '../controllers/auth/login';

const authRouter = new Hono();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);

export default authRouter;