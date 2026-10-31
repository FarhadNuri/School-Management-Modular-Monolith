import { Router } from 'express';
import { admminProtector } from '../auth/middleware/admin.middleware.js';
import { protectTeacher } from '../auth/middleware/teacher.middleware.js';
import { protectUser } from '../auth/middleware/user.middleware.js';

// Admin Grading Controllers
import {
  getAdminGradebooks,
  getAdminGradebookById,
  updateAdminGradebook,
  togglePublishGradebook,
} from './controllers/admin/gradebook.controller.js';

// Teacher Grading Controllers
import {
  getTeacherGradebooks,
  getTeacherGradebook,
  saveTeacherGradebook,
} from './controllers/teacher/gradebook.controller.js';
import {
  createExam,
  updateExam,
  getTeacherExams,
  getTeacherExamById,
  saveExamResults,
} from './controllers/teacher/exam.controller.js';

// User Grading Controllers
import { getMyGrades } from './controllers/user/grade.controller.js';
import { getMyExams, getMyExamById } from './controllers/user/exam.controller.js';

const router = Router();

// ========================
// ADMIN GRADING ROUTES
// ========================
router.get('/admin/grades', admminProtector, getAdminGradebooks);
router.get('/admin/grades/:id', admminProtector, getAdminGradebookById);
router.put('/admin/grades/:id', admminProtector, updateAdminGradebook);
router.patch('/admin/grades/:id/publish', admminProtector, togglePublishGradebook);

// ========================
// TEACHER GRADING ROUTES
// ========================
router.get('/teacher/grades', protectTeacher, getTeacherGradebooks);
router.get('/teacher/grades/:classId', protectTeacher, getTeacherGradebook);
router.put('/teacher/grades/:classId', protectTeacher, saveTeacherGradebook);

router.get('/teacher/exams', protectTeacher, getTeacherExams);
router.post('/teacher/exams', protectTeacher, createExam);
router.get('/teacher/exams/:id', protectTeacher, getTeacherExamById);
router.patch('/teacher/exams/:id', protectTeacher, updateExam);
router.put('/teacher/exams/:id/results', protectTeacher, saveExamResults);

// ========================
// USER GRADING ROUTES
// ========================
router.get('/user/grades', protectUser, getMyGrades);
router.get('/user/exams', protectUser, getMyExams);
router.get('/user/exams/:id', protectUser, getMyExamById);

export default router;
