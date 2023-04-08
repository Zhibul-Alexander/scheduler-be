import {Router} from 'express';

import {register, login, forgotPassword, forgotPasswordId} from '../controllers/auth.js';

const router: Router = Router();

router.post('/register', register);

router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.post('/forgot-password/:id', forgotPasswordId);

export default router;