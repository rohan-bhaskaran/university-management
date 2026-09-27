import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {protect, emailValidation} from '../middlewares/arcjet.middleware.js'; 
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent} from '../controllers/student.controller.js';

const router = express.Router();

router.get('/', protect, requireAuth(['admin']), getStudents);
router.get('/:id', protect, requireAuth(['student', 'admin']), getStudentById);
router.post('/', protect, emailValidation, requireAuth(['admin']), createStudent);
router.put('/:id', protect, emailValidation, requireAuth(['student', 'admin']), updateStudent);
router.delete('/:id', protect, requireAuth(['admin']), deleteStudent);

export default router;