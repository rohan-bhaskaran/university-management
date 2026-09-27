import type { Request, Response, NextFunction } from 'express';
import { eq, ilike, or } from 'drizzle-orm';

import { auth } from '../lib/auth.js';

import { db } from '../database/index.js';
import { student, classTable, classStudent } from '../database/schema/index.js';
import { createStudentSchema, updateStudentSchema } from '../validators/student.validator.js';

export const getStudents = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;

        if (!Number.isInteger(page) || page < 1) {
            res.status(400).json({message: 'Page must be a positive integer'});
            return;
        }

        const limit = 10;
        const offset = (page - 1) * limit; //pagination offset

        const searchCondition = search ? or(
            ilike(student.name, `%${search}%`),
            ilike(student.email, `%${search}%`)
        ) : undefined;

        const students = await db.select({
            id: student.id,
            userId: student.userId,
            name: student.name,
            email: student.email,
            profilePicture: student.profilePicture,
            gradeLevel: student.gradeLevel,
            createdAt: student.createdAt,
        }).from(student)
        .where(searchCondition)
        .limit(limit)
        .offset(offset);

        res.status(200).json({students, page, limit});
    } catch (err) {
        next(err);
    }
};

// Admin or self
export const getStudentById = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({message: 'Invalid student ID'});
            return;
        }

        const [studentProfile] = await db.select({
            id: student.id,
            userId: student.userId,
            name: student.name,
            email: student.email,
            profilePicture: student.profilePicture,
            gradeLevel: student.gradeLevel,
            createdAt: student.createdAt,
        }).from(student)
        .where(eq(student.id, id));

        if (!studentProfile) {
            res.status(404).json({message: 'Student not found'});
            return;
        }

        const classes = await db.select({
            id: classTable.id,
            name: classTable.name,
        }).from(classStudent).innerJoin(
            classTable, eq(classStudent.classId, classTable.id)
        ).where(eq(classStudent.studentId, id));

        const user = req.user;

        if (!user) {
            res.status(401).json({error: 'Unauthorized'});
            return;
        }

        const isAdmin = user.role === 'admin';
        const isSelf = user.id === studentProfile.userId;

        if (!isAdmin && !isSelf) {
            res.status(403).json({error: 'Forbidden'});
            return;
        }

        res.status(200).json({...studentProfile, classes});
    } catch (err) {
        next(err);
    }
};

// 2 step creation --> first create better auth user then the student profile
export const createStudent = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    let userId: string | undefined;

    try {
        const data = createStudentSchema.parse(req.body);; //zod validation in /validators

        const newUser = await auth.api.createUser({
            body: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: 'student',
            },
        });

        if (!newUser) {
            res.status(500).json({message: 'Failed to create authentication user'});
            return;
        }

        userId = newUser.user.id;

        const [newStudent] = await db.insert(student)
                                .values({
                                    userId,
                                    name: data.name,
                                    email: data.email,
                                    gradeLevel: data.gradeLevel,
                                    profilePicture: data.profilePicture,
                                })
                                .returning();

        res.status(201).json({message: 'Student created successfully', student: newStudent});
    } catch (err) {
        if (userId) { // in case of partial creation where better auth instance is created but not the student profile
            try {
                await auth.api.removeUser({body: { userId } });
            } catch (cleanupError) {
                console.error('Failed to clean up Better Auth user:', cleanupError);
            }
        }

        next(err);
    }
};

// Admin or self
export const updateStudent = async (req: Request, res: Response, next: NextFunction,) : Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({message: 'Invalid student ID'});
            return;
        }

        const data = updateStudentSchema.parse(req.body);

        const [existingStudent] = await db.select()
                                        .from(student)
                                        .where(eq(student.id, id));

        if (!existingStudent) {
            res.status(404).json({message: 'Student not found'});
            return;
        }

        const user = req.user;

        if (!user) {
            res.status(401).json({error: 'Unauthorized'});
            return;
        }

        const isAdmin = user.role === 'admin';
        const isSelf = user.id === existingStudent.userId;

        if (!isAdmin && !isSelf) {
            res.status(403).json({error: 'Forbidden'});
            return;
        }

        const [updatedStudent] = await db.update(student)
                                        .set({
                                            name: data.name,
                                            email: data.email,
                                            gradeLevel: data.gradeLevel,
                                            profilePicture: data.profilePicture,
                                        })
                                        .where(eq(student.id, id))
                                        .returning();

        if (data.name !== undefined || data.email !== undefined) {
            await auth.api.adminUpdateUser({
                body: {
                    userId: existingStudent.userId,
                    data: {
                        ...(data.name !== undefined && {name: data.name}),
                        ...(data.email !== undefined && {email: data.email}),
                    },
                },
            });
        }

        res.status(200).json({message: 'Student updated successfully', student: updatedStudent});
    } catch (err) {
        next(err);
    }
};

export const deleteStudent = async (req: Request, res: Response, next: NextFunction,) : Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({message: 'Invalid student ID'});
            return;
        }

        const [existingStudent] = await db.select()
                                    .from(student)
                                    .where(eq(student.id, id));

        if (!existingStudent) {
            res.status(404).json({message: 'Student not found'});
            return;
        }

        await db.delete(student).where(eq(student.id, id));

        await auth.api.removeUser({
            body: {userId: existingStudent.userId},
        });

        res.status(200).json({message: 'Student deleted successfully'});
    } catch (err) {
        next(err);
    }
};