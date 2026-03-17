import express from 'express';
import { adminRegister, adminLogin, adminLogout, updateAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.put('/update/:id', updateAdmin);
router.post('/logout', adminLogout);

export default router;
