import { Router } from 'express';
import {
  loginAdmin,
  getMe as getAdminMe,
  changePassword as changeAdminPassword,
  updateMyPhoto as updateAdminPhoto,
} from './controllers/admin.auth.controller.js';
import {
  loginUser,
  getMe as getUserMe,
  changePassword as changeUserPassword,
  updateMyPhoto as updateUserPhoto,
} from './controllers/user.auth.controller.js';
import { admminProtector } from './middleware/admin.middleware.js';
import { protectUser } from './middleware/user.middleware.js';
import { handleUserPhotoUpload } from '../../middleware/multer.middleware.js';

const router = Router();

// Admin Auth
router.post('/admin/login', loginAdmin);
router.get('/admin/me', admminProtector, getAdminMe);
router.patch('/admin/password', admminProtector, changeAdminPassword);
router.patch('/admin/photo', admminProtector, handleUserPhotoUpload, updateAdminPhoto);

// User Auth (Students, Teachers, Guardians)
router.post('/user/login', loginUser);
router.post('/login', loginUser); // alias
router.get('/user/me', protectUser, getUserMe);
router.get('/me', protectUser, getUserMe); // alias
router.patch('/user/change-password', protectUser, changeUserPassword);
router.patch('/user/password', protectUser, changeUserPassword);
router.patch('/change-password', protectUser, changeUserPassword); // alias
router.patch('/user/photo', protectUser, handleUserPhotoUpload, updateUserPhoto);
router.patch('/user/me/photo', protectUser, handleUserPhotoUpload, updateUserPhoto);
router.patch('/photo', protectUser, handleUserPhotoUpload, updateUserPhoto); // alias

export default router;
