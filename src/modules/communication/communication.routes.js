import { Router } from 'express';
import { admminProtector } from '../auth/middleware/admin.middleware.js';
import { protectTeacher } from '../auth/middleware/teacher.middleware.js';
import { protectUser } from '../auth/middleware/user.middleware.js';
import {
  handleAnnouncementUpload,
  handleComplaintUpload,
} from '../../middleware/multer.middleware.js';
import mailer from './utils/Mailer.js';

import {
  addAnnouncement as adminAddAnnouncement,
  getAnnouncements as adminGetAnnouncements,
  getAnnouncementById as adminGetAnnouncementById,
  updateAnnouncement as adminUpdateAnnouncement,
  deleteAnnouncement as adminDeleteAnnouncement,
} from './controllers/admin/announcement.controller.js';
import {
  getComplaints as adminGetComplaints,
  getComplaintById as adminGetComplaintById,
  updateComplaintStatus,
  deleteComplaint as adminDeleteComplaint,
} from './controllers/admin/complaint.controller.js';
import {
  createTeacherAnnouncement,
  getTeacherAnnouncements,
  updateTeacherAnnouncement,
  deleteTeacherAnnouncement,
} from './controllers/teacher/announcement.controller.js';
import {
  makeComplaint,
  getComplaints as userGetComplaints,
  getComplaintById as userGetComplaintById,
  updateComplaint as userUpdateComplaint,
} from './controllers/user/complaint.controller.js';
import {
  getMyAnnouncements,
  getMyAnnouncementById,
} from './controllers/user/announcement.controller.js';

const router = Router();

// ========================
// ADMIN COMMUNICATION ROUTES
// ========================
router.post('/admin/test-email', async (req, res) => {
  try {
    const to = req.body?.to || 'farhadnuri559@gmail.com';
    const result = await mailer.sendEmail({
      to,
      subject: 'School Management Email Test',
      text: 'This is a test email from the Admin Portal.',
      html: '<p>This is a test email verifying email delivery.</p>',
    });
    res.json({ success: true, message: 'Email delivered successfully', result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Announcements
router.post('/admin/announcements', admminProtector, handleAnnouncementUpload, adminAddAnnouncement);
router.get('/admin/announcements', admminProtector, adminGetAnnouncements);
router.get('/admin/announcements/:id', admminProtector, adminGetAnnouncementById);
router.patch('/admin/announcements/:id', admminProtector, handleAnnouncementUpload, adminUpdateAnnouncement);
router.delete('/admin/announcements/:id', admminProtector, adminDeleteAnnouncement);

// Complaints
router.get('/admin/complaints', admminProtector, adminGetComplaints);
router.get('/admin/complaints/:id', admminProtector, adminGetComplaintById);
router.patch('/admin/complaints/:id/status', admminProtector, updateComplaintStatus);
router.delete('/admin/complaints/:id', admminProtector, adminDeleteComplaint);

// ========================
// TEACHER COMMUNICATION ROUTES
// ========================
router.post('/teacher/announcements', protectTeacher, handleAnnouncementUpload, createTeacherAnnouncement);
router.get('/teacher/announcements', protectTeacher, getTeacherAnnouncements);
router.patch('/teacher/announcements/:id', protectTeacher, handleAnnouncementUpload, updateTeacherAnnouncement);
router.delete('/teacher/announcements/:id', protectTeacher, deleteTeacherAnnouncement);

// ========================
// USER COMMUNICATION ROUTES
// ========================
router.get('/user/announcements', protectUser, getMyAnnouncements);
router.get('/user/announcements/:id', protectUser, getMyAnnouncementById);

router.post('/user/complaints', protectUser, handleComplaintUpload, makeComplaint);
router.post('/user/complaint', protectUser, handleComplaintUpload, makeComplaint); // alias
router.get('/user/complaints', protectUser, userGetComplaints);
router.get('/user/complaints/:id', protectUser, userGetComplaintById);
router.get('/user/complaint/:id', protectUser, userGetComplaintById); // alias
router.patch('/user/complaints/:id', protectUser, handleComplaintUpload, userUpdateComplaint);
router.patch('/user/complaint/:id', protectUser, handleComplaintUpload, userUpdateComplaint); // alias

export default router;
