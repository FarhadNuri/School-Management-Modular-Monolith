import { Router } from 'express';
import { admminProtector } from '../auth/middleware/admin.middleware.js';
import { protectTeacher } from '../auth/middleware/teacher.middleware.js';
import { protectUser } from '../auth/middleware/user.middleware.js';
import {
  handleClassUpload,
  handleCourseUpload,
  handleStudentUpload,
  handleTeacherUpload,
  handleLessonUpload,
  handleHomeworkUpload,
} from '../../middleware/multer.middleware.js';

// Admin Academics Controllers
import {
  addClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
} from './controllers/admin/class.controller.js';
import {
  addCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from './controllers/admin/course.controller.js';
import {
  addStudent,
  getStudents,
  getStudentById,
  setStudentStatus,
  updateStudent,
  deleteStudent,
  resetStudentPassword,
} from './controllers/admin/student.controller.js';
import {
  addTeacher,
  getTeachers,
  getTeacherById,
  setTeacherStatus,
  updateTeacher,
  deleteTeacher,
  resetTeacherPassword,
} from './controllers/admin/teacher.controller.js';
import {
  getGuardianById,
  getGuardians,
  setGuardianStatus,
  updateGuardian,
  deleteGuardian,
  resetGuardianPassword,
} from './controllers/admin/guardian.controller.js';
import {
  getAdminRoutines,
  getAdminRoutineById,
  createAdminRoutine,
  updateAdminRoutine,
  deleteAdminRoutine,
} from './controllers/admin/routine.controller.js';
import { getAdminDashboard } from './controllers/admin/dashboard.controller.js';

// Teacher Academics Controllers
import {
  getTeacherClasses,
  getTeacherClassById,
  getTeacherGuardians,
  getTeacherGuardianById,
  getTeacherCourses,
} from './controllers/teacher/teacher.controller.js';
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getTeacherLessons,
  getTeacherLessonById,
} from './controllers/teacher/lesson.controller.js';
import {
  createHomework,
  updateHomework,
  deleteHomework,
  getTeacherHomeworks,
  getTeacherHomeworkById,
} from './controllers/teacher/homework.controller.js';
import { getHomeworkSubmissions } from './controllers/user/homework.controller.js';
import {
  getTeacherAttendanceSections,
  getSectionMonthlyAttendance,
  getSectionDailyAttendance,
  saveSectionDailyAttendance,
  getLessonAttendance,
  saveLessonAttendance,
  getTeacherAttendanceLessons,
} from './controllers/teacher/attendance.controller.js';

// User Academics Controllers
import {
  getMyCourses,
  getMyCourseById,
  getMyLessons,
  getMyLessonById,
} from './controllers/user/lesson.controller.js';
import {
  getMyHomeworks,
  getMyHomeworkById,
  submitHomework,
} from './controllers/user/homework.controller.js';
import {
  getMyStudents,
  getMyStudentById,
} from './controllers/user/student.controller.js';
import {
  getMyAttendance,
  getMyAttendanceSummary,
  getMyAttendanceWards,
  getMyLessonAttendance,
} from './controllers/user/attendance.controller.js';
import { getMyRoutine } from './controllers/user/routine.controller.js';
import { getMyDashboard } from './controllers/user/dashboard.controller.js';

const router = Router();

// ========================
// ADMIN ACADEMICS ROUTES
// ========================
router.get('/admin/dashboard', admminProtector, getAdminDashboard);

// Classes
router.get('/admin/classes', admminProtector, getClasses);
router.post('/admin/classes', admminProtector, handleClassUpload, addClass);
router.get('/admin/classes/:id', admminProtector, getClassById);
router.patch('/admin/classes/:id', admminProtector, handleClassUpload, updateClass);
router.delete('/admin/classes/:id', admminProtector, deleteClass);

// Courses
router.get('/admin/courses', admminProtector, getCourses);
router.post('/admin/courses', admminProtector, handleCourseUpload, addCourse);
router.get('/admin/courses/:id', admminProtector, getCourseById);
router.patch('/admin/courses/:id', admminProtector, handleCourseUpload, updateCourse);
router.delete('/admin/courses/:id', admminProtector, deleteCourse);

// Students
router.get('/admin/students', admminProtector, getStudents);
router.post('/admin/students', admminProtector, handleStudentUpload, addStudent);
router.get('/admin/students/:id', admminProtector, getStudentById);
router.patch('/admin/students/:id', admminProtector, handleStudentUpload, updateStudent);
router.delete('/admin/students/:id', admminProtector, deleteStudent);
router.patch('/admin/students/:id/status', admminProtector, setStudentStatus);
router.patch('/admin/students/:id/reset-password', admminProtector, resetStudentPassword);

// Guardians
router.get('/admin/guardians', admminProtector, getGuardians);
router.get('/admin/guardians/:id', admminProtector, getGuardianById);
router.patch('/admin/guardians/:id', admminProtector, updateGuardian);
router.delete('/admin/guardians/:id', admminProtector, deleteGuardian);
router.patch('/admin/guardians/:id/status', admminProtector, setGuardianStatus);
router.patch('/admin/guardians/:id/reset-password', admminProtector, resetGuardianPassword);

// Teachers
router.get('/admin/teachers', admminProtector, getTeachers);
router.post('/admin/teachers', admminProtector, handleTeacherUpload, addTeacher);
router.get('/admin/teachers/:id', admminProtector, getTeacherById);
router.patch('/admin/teachers/:id', admminProtector, handleTeacherUpload, updateTeacher);
router.delete('/admin/teachers/:id', admminProtector, deleteTeacher);
router.patch('/admin/teachers/:id/status', admminProtector, setTeacherStatus);
router.patch('/admin/teachers/:id/reset-password', admminProtector, resetTeacherPassword);

// Routines
router.get('/admin/routines', admminProtector, getAdminRoutines);
router.post('/admin/routines', admminProtector, createAdminRoutine);
router.get('/admin/routines/:id', admminProtector, getAdminRoutineById);
router.put('/admin/routines/:id', admminProtector, updateAdminRoutine);
router.patch('/admin/routines/:id', admminProtector, updateAdminRoutine);
router.delete('/admin/routines/:id', admminProtector, deleteAdminRoutine);

// ========================
// TEACHER ACADEMICS ROUTES
// ========================
router.get('/teacher/classes', protectTeacher, getTeacherClasses);
router.get('/teacher/classes/:id', protectTeacher, getTeacherClassById);
router.get('/teacher/courses', protectTeacher, getTeacherCourses);
router.get('/teacher/guardians', protectTeacher, getTeacherGuardians);
router.get('/teacher/guardians/:id', protectTeacher, getTeacherGuardianById);

// Materials & Lessons
router.get('/teacher/materials', protectTeacher, getTeacherLessons);
router.post('/teacher/materials', protectTeacher, handleLessonUpload, createLesson);
router.get('/teacher/materials/:id', protectTeacher, getTeacherLessonById);
router.patch('/teacher/materials/:id', protectTeacher, handleLessonUpload, updateLesson);
router.delete('/teacher/materials/:id', protectTeacher, deleteLesson);

router.get('/teacher/lessons', protectTeacher, getTeacherLessons);
router.post('/teacher/lessons', protectTeacher, handleLessonUpload, createLesson);
router.get('/teacher/lessons/:id', protectTeacher, getTeacherLessonById);
router.patch('/teacher/lessons/:id', protectTeacher, handleLessonUpload, updateLesson);
router.delete('/teacher/lessons/:id', protectTeacher, deleteLesson);

// Homework
router.get('/teacher/homeworks', protectTeacher, getTeacherHomeworks);
router.post('/teacher/homeworks', protectTeacher, handleHomeworkUpload, createHomework);
router.get('/teacher/homeworks/:id', protectTeacher, getTeacherHomeworkById);
router.get('/teacher/homeworks/:id/submissions', protectTeacher, getHomeworkSubmissions);
router.patch('/teacher/homeworks/:id', protectTeacher, handleHomeworkUpload, updateHomework);
router.delete('/teacher/homeworks/:id', protectTeacher, deleteHomework);

// Attendance
router.get('/teacher/attendance/sections', protectTeacher, getTeacherAttendanceSections);
router.get('/teacher/attendance/sections/:classId/monthly', protectTeacher, getSectionMonthlyAttendance);
router.get('/teacher/attendance/sections/:classId/date/:date', protectTeacher, getSectionDailyAttendance);
router.put('/teacher/attendance/sections/:classId/date/:date', protectTeacher, saveSectionDailyAttendance);

router.get('/teacher/attendance/lessons', protectTeacher, getTeacherAttendanceLessons);
router.get('/teacher/attendance/lessons/:lessonId', protectTeacher, getLessonAttendance);
router.put('/teacher/attendance/lessons/:lessonId', protectTeacher, saveLessonAttendance);

// ========================
// USER (STUDENT & GUARDIAN) ACADEMICS ROUTES
// ========================
router.get('/user/dashboard', protectUser, getMyDashboard);
router.get('/user/courses', protectUser, getMyCourses);
router.get('/user/courses/:id', protectUser, getMyCourseById);
router.get('/user/materials', protectUser, getMyLessons);
router.get('/user/materials/:id', protectUser, getMyLessonById);
router.get('/user/lessons', protectUser, getMyLessons);
router.get('/user/lessons/:id', protectUser, getMyLessonById);

router.get('/user/homeworks', protectUser, getMyHomeworks);
router.get('/user/homeworks/:id', protectUser, getMyHomeworkById);
router.post('/user/homeworks/:id/submit', protectUser, handleHomeworkUpload, submitHomework);

router.get('/user/students', protectUser, getMyStudents);
router.get('/user/students/:id', protectUser, getMyStudentById);

router.get('/user/attendance', protectUser, getMyAttendance);
router.get('/user/attendance/summary', protectUser, getMyAttendanceSummary);
router.get('/user/attendance/wards', protectUser, getMyAttendanceWards);
router.get('/user/attendance/lessons/:lessonId', protectUser, getMyLessonAttendance);

router.get('/user/routine', protectUser, getMyRoutine);

export default router;
