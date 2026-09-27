import { z } from 'zod';

export const createClassSchema = z.object({
    name: z.string().trim().min(1, 'Class name is required'),
    subjectId: z.number()
        .int('Subject ID must be an integer')
        .positive('Subject ID must be positive'),
    capacity: z.number()
        .int('Capacity must be an integer')
        .positive('Capacity must be positive'),
});

export const updateClassSchema = z.object({
    name: z.string().trim().min(1, 'Class name is required').optional(),
    subjectId: z.number()
        .int('Subject ID must be an integer')
        .positive('Subject ID must be positive')
        .optional(),
    capacity: z.number()
        .int('Capacity must be an integer')
        .positive('Capacity must be positive')
        .optional(),
});

export const assignTeacherSchema = z.object({
    teacherId: z.number()
        .int('Teacher ID must be an integer')
        .positive('Teacher ID must be positive'),
});

export const joinClassSchema = z.object({
    joinCode: z.string().trim().min(1, 'Join code is required'),
});