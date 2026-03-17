import express from 'express';
import { register, login, updateUser, logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update/:id', updateUser);
router.post('/logout', logout);

export default router;
