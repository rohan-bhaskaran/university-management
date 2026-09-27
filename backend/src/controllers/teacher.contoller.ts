import type { Request, Response, NextFunction } from 'express';
import { eq, and, ilike, or } from 'drizzle-orm';

import {auth} from '../lib/auth.js';

import { db } from '../database/index.js';
import { teacher, student, classTable, classTeacher } from '../database/schema/index.js';
import { createTeacherSchema, updateTeacherSchema } from '../validators/teacher.validator.js';
import { off } from 'node:cluster';

export const getTeachers = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;

        if (!Number.isInteger(page) || page < 1) {
            res.status(400).json({message: 'Page must be a positive integer'});
            return;
        }
            
        const limit = 10;
        const offset = (page -1)*limit; //pagination offset
        
        const searchCondition = search ? or ( ilike(teacher.name, `%${search}%`) , ilike(teacher.email, `%${search}`) ) : undefined;

        const teachers = await db.select({
            id: teacher.id,
            userId: teacher.userId,
            name: teacher.name,
            email: teacher.email,
            profilePicture: teacher.profilePicture,
            subjectId: teacher.subjectId,
            createdAt: teacher.createdAt,
        }).from(teacher)
        .where(searchCondition)
        .limit(limit)
        .offset(offset);

        res.status(200).json({teachers, page, limit});
    } catch (err) {
        next(err);
    }
};

export const getTeacherById = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {//inbuilt js func which checks if it is a valid number
            res.status(400).json({message: 'Invalid subject ID'});
            return;
        }

        const [teacherProfile] = await db.select({
            id: teacher.id,
            userId: teacher.userId,
            name: teacher.name,
            email: teacher.email,
            profilePicture: teacher.profilePicture,
            subjectId: teacher.subjectId,
            createdAt: teacher.createdAt,
        }).from(teacher)
        .where(eq(teacher.id, id));
        if (!teacherProfile) {
            res.status(404).json({message: 'Teacher not found'});
            return;
        }
        
        const classes = await db.select({
            id: classTable.id,
            name: classTable.name,
        }).from(classTeacher).innerJoin(
            classTable, eq(classTeacher.classId, classTable.id)
        ).where(eq(classTeacher.teacherId, id));

        const user = req.user;
        if (!user) {
            res.status(401).json({error: 'Unauthorized'});
            return;
        }

        const isAdmin = user.role === 'admin';
        const isSelf = user.id === teacherProfile.userId;
        if (!isAdmin && !isSelf) {
            res.status(403).json({error: 'Forbidden'});
            return;
        }

        res.status(200).json({...teacherProfile, classes});
    } catch (err) {
        next(err);
    }
};

// 2 step creation --> first create better auth user then the teacher profile
export const createTeacher = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    let userId: string | undefined;
    try {
        const data = createTeacherSchema.parse(req.body);; //zod validation in /validations

        const newUser = await auth.api.createUser({
            body: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: 'teacher', 
            },
        });
        if (!newUser) {
            res.status(500).json({message: 'Failed to create authentication user'});
            return;
        }
        userId = newUser.user.id;

        const [newTeacher] = await db.insert(teacher)
                                .values({
                                    userId,
                                    name: data.name,
                                    email: data.email,
                                    subjectId: data.subjectId,
                                    profilePicture: data.profilePicture,
                                })
                                .returning();

        res.status(201).json({message: 'Teacher created successfully', teacher: newTeacher});
    } catch (err) {
        if (userId) { // in case of partial creation where better auth instance is created but not the teacher profile 
            try {
                await auth.api.removeUser({body: { userId } });
            } catch (cleanupError) {
                console.error('Failed to clean up Better Auth user:', cleanupError);
            }
        }
        next(err);
    }
};

export const updateTeacher = async (req: Request,res: Response,next: NextFunction,): Promise<void> => {
    try {
        const id = Number(req.params.id);
        if ( !Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: 'Invalid teacher ID'});
            return;
        }

        const data = updateTeacherSchema.parse(req.body);

        const [existingTeacher] = await db.select()
                                        .from(teacher)
                                        .where(eq(teacher.id, id));
        if (!existingTeacher) {
            res.status(404).json({message: 'Teacher not found'});
            return;
        }

        const user = req.user;
        if (!user) {
            res.status(401).json({error: 'Unauthorized'});
            return;
        }

        const isAdmin = user.role === 'admin';
        const isSelf = user.id === existingTeacher.userId;
        
        if (!isAdmin && !isSelf) {
            res.status(403).json({error: 'Forbidden'});
            return;
        }

        const [updatedTeacher] = await db.update(teacher)
                                        .set({
                                            name: data.name,
                                            email: data.email,
                                            subjectId: data.subjectId,
                                            profilePicture: data.profilePicture,
                                        })
                                        .where(eq(teacher.id, id))
                                        .returning();
        if ( data.name !== undefined || data.email !== undefined) {
            await auth.api.adminUpdateUser({
                body: {
                    userId: existingTeacher.userId,
                    data: {...(data.name !== undefined && {name: data.name,}),  
                            ...(data.email !== undefined && {email: data.email}),
                    },
                },
            });
        }

        res.status(200).json({ message: 'Teacher updated successfully', teacher: updatedTeacher});
    } catch (err) {
        next(err);
    }
};

export const deleteTeacher = async ( req: Request, res: Response, next: NextFunction,): Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) ||id <= 0) {
            res.status(400).json({message: 'Invalid teacher ID'});
            return;
        }

        const [existingTeacher] = await db.select()
                                    .from(teacher)
                                    .where(eq(teacher.id, id));
        if (!existingTeacher) {
            res.status(404).json({message: 'Teacher not found'});
            return;
        }

        await db.delete(teacher).where(eq(teacher.id, id));

        await auth.api.removeUser({
            body: {userId: existingTeacher.userId},
        });

        res.status(200).json({message: 'Teacher deleted successfully'});
    } catch (err) {
        next(err);
    }
};