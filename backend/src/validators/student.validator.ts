import { z } from 'zod';

export const createStudentSchema = z.object({
    name: z.string().trim().min(1, 'Student name is required'),
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    gradeLevel: z.number()
        .int('Grade level must be an integer')
        .min(1, 'Grade level must be at least 1')
        .max(12, 'Grade level must be at most 12'),
    profilePicture: z.string().url('Profile picture must be a valid URL').optional(),
});

export const updateStudentSchema = z.object({
    name: z.string().trim().min(1, 'Student name is required').optional(),
    email: z.string().trim().email('Invalid email address').optional(),
    gradeLevel: z.number()
        .int('Grade level must be an integer')
        .min(1, 'Grade level must be at least 1')
        .max(12, 'Grade level must be at most 12')
        .optional(),
    profilePicture: z.string().url('Profile picture must be a valid URL').nullable().optional(),
});