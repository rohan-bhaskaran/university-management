import type { Request, Response, NextFunction } from 'express';
import { eq, and, count} from 'drizzle-orm';

import { db } from '../database/index.js';
import {classTable, classTeacher, classStudent, subject, teacher, student} from '../database/schema/index.js';
import { createClassSchema, updateClassSchema, assignTeacherSchema, joinClassSchema } from '../validators/class.validator.js';

const generateJoinCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getClasses = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const subjectId  = typeof req.query.subjectId === 'string' ? Number(req.query.subjectId) : undefined;
        const teacherId  = typeof req.query.teacherId === 'string' ? Number(req.query.teacherId) : undefined;

        if ( subjectId !== undefined && (!Number.isInteger(subjectId) || subjectId <= 0)) {
            res.status(400).json({message: 'Invalid subject ID'});
            return;
        }
        if ( teacherId !== undefined && (!Number.isInteger(teacherId) || teacherId <= 0)) {
            res.status(400).json({message: 'Invalid teacher ID'});
            return;
        }

        const conditions = [];
        if (subjectId !== undefined) conditions.push(eq(classTable.subjectId, subjectId));
        if (teacherId !== undefined) conditions.push(eq(classTeacher.teacherId, teacherId));

        const classes = await db.selectDistinct({
                                    id: classTable.id,
                                    name: classTable.name,
                                    subjectId: classTable.subjectId,
                                    capacity: classTable.capacity,
                                    joinCode: classTable.joinCode,
                                    schedule: classTable.schedule,
                                    createdAt: classTable.createdAt,
                                })
                                .from(classTable)
                                .leftJoin(
                                    classTeacher,
                                    eq(classTable.id, classTeacher.classId),
                                )
                                .where(conditions.length > 0 ? and(...conditions) : undefined);

        res.status(200).json({classes});
    } catch (err) {
        next(err);
    }
}

export const getClassById = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {//inbuilt js func which checks if it is a valid number
            res.status(400).json({message: 'Invalid class ID'});
            return;
        }

        const [classData] = await db.select({
                                        id: classTable.id,
                                        name: classTable.name,
                                        subjectId: classTable.subjectId,
                                        capacity: classTable.capacity,
                                        joinCode: classTable.joinCode,
                                        schedule: classTable.schedule,
                                        createdAt: classTable.createdAt,
                                        subject: { id: subject.id, name: subject.name },
                                    })
                                    .from(classTable)
                                    .leftJoin(
                                        subject,
                                        eq(classTable.subjectId, subject.id),
                                    )
                                    .where(eq(classTable.id, id));

        if (!classData) {
            res.status(404).json({message: 'Class not found'});
            return;
        }

        const teachers = await db.select({
                                    id: teacher.id,
                                    userId: teacher.userId,
                                    name: teacher.name,
                                    email: teacher.email,
                                    profilePicture: teacher.profilePicture,
                                })
                                .from(classTeacher)
                                .innerJoin(
                                    teacher,
                                    eq(classTeacher.teacherId, teacher.id),
                                )
                                .where(eq(classTeacher.classId, id));

        const students = await db.select({
                                    id: student.id,
                                    userId: student.userId,
                                    name: student.name,
                                    email: student.email,
                                    profilePicture: student.profilePicture,
                                    gradeLevel: student.gradeLevel,
                                })
                                .from(classStudent)
                                .innerJoin(
                                    student,
                                    eq(classStudent.studentId, student.id),
                                )
                                .where(eq(classStudent.classId, id));

        res.status(200).json({ ...classData, teachers, students});
    } catch (err) {
        next(err);
    }
}

export const createClass = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const data = createClassSchema.parse(req.body);
        let joinCode: string;
        let existingClass;

        //genius resolve to make sure the random code dosent alr exist
        do {
            joinCode = generateJoinCode();

            [existingClass] = await db.select({id: classTable.id})
                                        .from(classTable)
                                        .where(eq(classTable.joinCode, joinCode));
        } while (existingClass);

        const [newClass] = await db.insert(classTable)
                                    .values({
                                        name: data.name,
                                        subjectId: data.subjectId,
                                        capacity: data.capacity,
                                        joinCode,
                                    })
                                    .returning();

        res.status(201).json({ message: 'Class created successfully', class: newClass });
    } catch (err) {
        next(err);
    }
};

export const updateClass = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({message: 'Invalid class ID'});
            return;
        }

        const data = updateClassSchema.parse(req.body);

        const [existingClass] = await db.select()
                                        .from(classTable)
                                        .where(eq(classTable.id, id));
        if (!existingClass) {
            res.status(404).json({message: 'Class not found'});
            return;
        }

        const [updatedClass] = await db.update(classTable)
                                        .set({
                                            ...(data.name !== undefined && {name: data.name}),
                                            ...(data.subjectId !== undefined && {subjectId: data.subjectId}),
                                            ...(data.capacity !== undefined && {capacity: data.capacity}),
                                        })
                                        .where(eq(classTable.id, id))
                                        .returning();

        res.status(200).json({ message: 'Class updated successfully', class: updatedClass});
    } catch (err) {
        next(err);
    }
}

export const deleteClass = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({message: 'Invalid class ID'});
            return;
        }

        const [deletedClass] = await db.delete(classTable)
                                        .where(eq(classTable.id, id))
                                        .returning();
        if (!deletedClass) {
            res.status(404).json({message: 'Class not found'});
            return;
        }

        res.status(200).json({ message: 'Class deleted successfully', class: deletedClass });
    } catch (err) {
        next(err);
    }
};

export const assignTeacher = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const classId = Number(req.params.id);
        if (!Number.isInteger(classId) || classId <= 0) {
            res.status(400).json({message: 'Invalid class ID'});
            return;
        }

        const data = assignTeacherSchema.parse(req.body);

        const [existingClass] = await db.select({id: classTable.id})
                                        .from(classTable)
                                        .where(eq(classTable.id, classId));
        if (!existingClass) {
            res.status(404).json({message: 'Class not found'});
            return;
        }

        const [existingTeacher] = await db.select({id: teacher.id})
                                        .from(teacher)
                                        .where(eq(teacher.id, data.teacherId));
        if (!existingTeacher) {
            res.status(404).json({message: 'Teacher not found'});
            return;
        }

        const [assignment] = await db.insert(classTeacher)
                                    .values({
                                        classId,
                                        teacherId: data.teacherId,
                                    })
                                    .returning();

        res.status(201).json({ message: 'Teacher assigned successfully', assignment });
    } catch (err) {
        next(err);
    }
};

export const removeTeacher = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const classId = Number(req.params.id);
        const teacherId = Number(req.params.teacherId);

        if (!Number.isInteger(classId) || classId <= 0) {
            res.status(400).json({message: 'Invalid class ID'});
            return;
        }
        if (!Number.isInteger(teacherId) || teacherId <= 0) {
            res.status(400).json({message: 'Invalid teacher ID'});
            return;
        }

        const [removedTeacher] = await db.delete(classTeacher)
                                        .where(and( eq(classTeacher.classId, classId), eq(classTeacher.teacherId, teacherId)))
                                        .returning();
        if (!removedTeacher) {
            res.status(404).json({message: 'Teacher is not assigned to this class'});
            return;
        }

        res.status(200).json({message: 'Teacher removed from class successfully'});
    } catch (err) {
        next(err);
    }
};

export const joinClass = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const data = joinClassSchema.parse(req.body);

        const [classData] = await db.select({
                                        id: classTable.id,
                                        name: classTable.name,
                                        capacity: classTable.capacity,
                                    })
                                    .from(classTable)
                                    .where(eq(classTable.joinCode, data.joinCode));
        if (!classData) {
            res.status(404).json({message: 'Invalid join code'});
            return;
        }

        const user = req.user;
        if (!user) {
            res.status(401).json({error: 'Unauthorized'});
            return;
        }

        const [studentProfile] = await db.select({
                                            id: student.id,
                                            name: student.name,
                                        })
                                        .from(student)
                                        .where(eq(student.userId, user.id));
        if (!studentProfile) {
            res.status(404).json({message: 'Student profile not found'});
            return;
        }

        const [existingEnrollment] = await db.select({id: classStudent.id})
                                            .from(classStudent)
                                            .where(and( eq(classStudent.classId, classData.id), eq(classStudent.studentId, studentProfile.id)));
        if (existingEnrollment) {
            res.status(409).json({message: 'Student has already joined this class'});
            return;
        }

        const [studentCount] = await db.select({count: count(classStudent.id)})
                                        .from(classStudent)
                                        .where(eq(classStudent.classId, classData.id));
        if (Number(studentCount.count) >= classData.capacity) {
            res.status(400).json({message: 'Class is full'});
            return;
        }

        const [enrollment] = await db.insert(classStudent)
                                    .values({
                                        classId: classData.id,
                                        studentId: studentProfile.id,
                                    })
                                    .returning();

        res.status(201).json({ message: 'Joined class successfully', enrollment });
    } catch (err) {
        next(err);
    }
};