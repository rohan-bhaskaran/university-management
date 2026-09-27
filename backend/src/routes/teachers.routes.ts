import express from 'express';
import {requireAuth} from '../middlewares/auth.middleware.js';
import {protect, emailValidation} from '../middlewares/arcjet.middleware.js';
import { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher} from '../controllers/teacher.contoller.js';

const router = express.Router();

router.get('/', protect, requireAuth(['admin']), getTeachers);
router.get('/:id', protect, requireAuth(['teacher', 'admin']), getTeacherById);//thoguh acc to our code , internalyl the controllers also handle role base auth
router.post('/', protect, emailValidation, requireAuth(['admin']), createTeacher);
router.put('/:id', protect, emailValidation, requireAuth(['admin', 'teacher']), updateTeacher);
router.delete('/:id', protect, requireAuth(['admin']), deleteTeacher);

export default router;