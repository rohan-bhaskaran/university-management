import express from 'express';
import {requireAuth} from '../middlewares/auth.middleware.js';
import { protect } from '../middlewares/arcjet.middleware.js';
import { getSubjects, getSubjectById, createSubject, deleteSubject} from '../controllers/subject.controller.js';

const router = express.Router();

router.get('/', protect, requireAuth(['student', 'teacher', 'admin']), getSubjects);
router.get('/:id', protect, requireAuth(['student', 'teacher', 'admin']), getSubjectById);
router.post('/', protect, requireAuth(['admin']), createSubject);
router.delete('/:id', protect, requireAuth(['admin']), deleteSubject);

export default router;