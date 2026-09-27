import {z} from 'zod';
import { department } from '../database/schema/academics.js';

export const createSubjectSchema = z.object({
    name: z.string().trim().min(1, 'Subject name is required'),
    departmentId: z.number().int('Department ID must be and Integer').positive('Department ID must be Positive')
});