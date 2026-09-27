import express from 'express';

import { protect } from '../middlewares/arcjet.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

import { getClasses, getClassById, createClass, updateClass, deleteClass, assignTeacher, removeTeacher, joinClass} from '../controllers/class.controller.js';

const router = express.Router();

router.get('/', protect, requireAuth(['admin', 'student', 'teacher']), getClasses);
router.get('/:id', protect, requireAuth(['admin', 'student', 'teacher']), getClassById);
router.post('/', protect, requireAuth(['admin']), createClass);
router.put('/:id', protect, requireAuth(['admin']), updateClass);
router.delete('/:id', protect, requireAuth(['admin']), deleteClass);
router.post('/:id/teachers', protect, requireAuth(['admin']), assignTeacher);
router.delete('/:id/teachers/:teacherId', protect, requireAuth(['admin']), removeTeacher);
router.post('/join', protect, requireAuth(['student']), joinClass);

export default router;
