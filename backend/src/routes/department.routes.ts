import express from 'express';
import {requireAuth} from '../middlewares/auth.middleware.js';
import { protect } from '../middlewares/arcjet.middleware.js';
import { getDepartments ,getDepartmentById ,createDepartment ,deleteDepartment} from '../controllers/department.controller.js';

const router = express.Router();

router.get('/', protect, requireAuth(['student', 'teacher', 'admin']), getDepartments);// can leave parameters of requireAuth empty too as it is still valid cause then [] roles.length !> 0 and roles restriction is not applied
router.get('/:id', protect, requireAuth(['student', 'teacher', 'admin']), getDepartmentById);
router.post('/', protect, requireAuth(['admin']), createDepartment);
router.delete('/:id', protect, requireAuth(['admin']), deleteDepartment);

export default router;