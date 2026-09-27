import type { Request, Response, NextFunction } from 'express';
import { count } from 'drizzle-orm';

import { db } from '../database/index.js';
import { teacher, student, classTable, department } from '../database/schema/index.js';

export const getStats = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const [teacherCount, studentCount, classCount, departmentCount] = await Promise.all([db.select({ count: count() }).from(teacher), // typesafe as in newer drizzle version counts type is infered
                                                                                            db.select({ count: count() }).from(student),
                                                                                            db.select({ count: count() }).from(classTable),
                                                                                            db.select({ count: count() }).from(department)]);
        res.status(200).json({teachers: teacherCount[0].count, students: studentCount[0].count,
                            classes: classCount[0].count, departments: departmentCount[0].count});
    } catch (err) {
        next(err);
    }
}