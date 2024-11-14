import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../validations/authValidation';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout); 

export default router;
