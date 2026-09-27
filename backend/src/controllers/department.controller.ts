import type { Request, Response, NextFunction } from 'express';
import { eq, count } from 'drizzle-orm';

import { db } from '../database/index.js';
import { department, subject } from '../database/schema/academics.js';
import { createDepartmentSchema } from '../validators/department.validator.js';

export const getDepartments = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const departments = await db.select({
            id: department.id,
            name: department.name,
            subjectCount: count(subject.id),
        }).from(department)
        .leftJoin(subject, eq(department.id, subject.departmentId))
        .groupBy(department.id);

        res.status(200).json({departments});
    } catch (err) {
        next(err);
    }
}

export const getDepartmentById = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {//inbuilt js func which checks if it is a valid number
            res.status(400).json({message: 'Invalid department ID'});
            return;
        }

        const rows = await db.select({
            department: department,
            subject: subject,
        }).from(department)
        .leftJoin(subject, eq(department.id, subject.departmentId))
        .where(eq(department.id, id));

        if (rows.length === 0) {
            res.status(404).json({message: 'Department not found'});
            return;
        }

        const result = { // n rows for n non null subjects with same department
            ...rows[0].department,
            subjects: rows.map((row) => row.subject)
                        .filter((subject) => subject !== null),
        };
        res.status(200).json({result});
    } catch (err) {
        next(err);
    }
}

export const createDepartment = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const {name} = createDepartmentSchema.parse(req.body); //zod validation in /validations
        // if (typeof name !== 'string' || name.trim().length === 0) {
        //     res.status(400).json({message: 'Department name is required'});
        //     return;
        // } 

        const [newDepartment] = await db.insert(department)
                                        .values({name: name.trim()})
                                        .returning();
        res.status(201).json({message: 'Department created successfully', department: newDepartment});
    } catch (err) {
        next(err);
    }
}

export const deleteDepartment = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({message: 'Invalid department ID'});
            return;
        }

        const [deletedDepartment] = await db.delete(department)
                                        .where(eq(department.id, id))
                                        .returning();

        if (!deletedDepartment) {
            res.status(404).json({message: 'Department not found'});
            return;
        }
        res.status(200).json({message: 'Department deleted successfully', department: deleteDepartment});
    } catch (err) {
        next(err);
    }
}

