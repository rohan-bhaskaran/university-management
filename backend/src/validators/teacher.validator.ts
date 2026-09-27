import { z } from 'zod';

export const createTeacherSchema = z.object({
    name: z.string().trim().min(1, 'Teacher name is required'),
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),//the above 3 are default needed by better auth
    subjectId: z.number().int('Subject ID must be an integer').positive('Subject ID must be positive').optional(),
    profilePicture: z.string().url('Profile picture must be a valid URL').optional(),
});

export const updateTeacherSchema = z.object({
    name: z.string().trim().min(1, 'Teacher name is required').optional(),
    email: z.string().trim().email('Invalid email address').optional(),
    subjectId: z.number().int('Subject ID must be an integer').positive('Subject ID must be positive').nullable().optional(),
    profilePicture: z.string().url('Profile picture must be a valid URL').nullable().optional(),
});