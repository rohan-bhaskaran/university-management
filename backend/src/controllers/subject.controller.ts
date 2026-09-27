import type { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';

import { db } from '../database/index.js';
import { department, subject } from '../database/schema/academics.js';
import { createSubjectSchema } from '../validators/subject.validators.js';

//get all subjects or for a departmentId as a query
export const getSubjects = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
        if ( req.query.departmentId !== undefined && (Number.isNaN(departmentId) || !Number.isInteger(departmentId))) {
            res.status(400).json({message: 'Invalid department ID'});
            return;
        }

        const subjects = await db.select({
            id: subject.id,
            name: subject.name,
            departmentId: subject.departmentId,
            departmentName: department.name,
        }).from(subject)
        .leftJoin(department, eq(subject.departmentId, department.id))
        .where(departmentId !== undefined ? eq(subject.departmentId, departmentId) : undefined); // apparently ternary statements are supported inside where

        res.status(200).json({subjects});
    } catch (err) {
        next(err);
    }
}

export const getSubjectById = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {//inbuilt js func which checks if it is a valid number
            res.status(400).json({message: 'Invalid subject ID'});
            return;
        }

        const [result] = await db.select({
            id: subject.id,
            name: subject.name,
            departmentId: subject.departmentId,
            department: department,
        }).from(subject)
        .leftJoin(department, eq(subject.departmentId, department.id))
        .where(eq(subject.id, id));

        if (!result) {
            res.status(404).json({message: 'Subject not found'});
            return;
        }
        res.status(200).json({result});
    } catch (err) {
        next(err);
    }
}

export const createSubject = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const {name, departmentId} = createSubjectSchema.parse(req.body); //zod validation in /validations

        const [existingDepartment] = await db.select({
            id: department.id,
        }).from(department)
        .where(eq(department.id, departmentId));

        if (!existingDepartment) {
            res.status(404).json({message: 'Department not found'});
            return;
        }

        const [newSubject] = await db.insert(subject)
                                        .values({name: name.trim(), departmentId: departmentId})
                                        .returning();
        res.status(201).json({message: 'Subject created successfully', subject: newSubject});
    } catch (err) {
        next(err);
    }
}

export const deleteSubject = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({message: 'Invalid subejct ID'});
            return;
        }

        const [deletedSubject] = await db.delete(subject)
                                        .where(eq(subject.id, id))
                                        .returning();

        if (!deletedSubject) {
            res.status(404).json({message: 'Subject not found'});
            return;
        }
        res.status(200).json({message: 'Subject deleted successfully', subject: deleteSubject});
    } catch (err) {
        next(err);
    }
}