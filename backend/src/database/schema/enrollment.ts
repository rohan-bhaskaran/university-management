import { pgTable, serial, integer, timestamp, unique} from 'drizzle-orm/pg-core';
import { classTable } from './academics.js';
import { teacher, student } from './users.js';

export const classTeacher = pgTable('class_teacher', {
    id: serial('id').primaryKey(),
    classId: integer('class_id')
                .references(() => classTable.id, {onDelete: 'cascade'}),
    teacherId: integer('teacher_id')
                .references(() => teacher.id, {onDelete: 'cascade'}),
    createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => [
    unique('unique_class_teacher').on(table.classId, table.teacherId)   // note this unique and on join
])

export const classStudent = pgTable('class_student', {
    id: serial('id').primaryKey(),
    classId: integer('class_id')
                .references(() => classTable.id, {onDelete: 'cascade'}),
    studentId: integer('student_id')
                .references(() => student.id, {onDelete: 'cascade'}),
    joinedAt: timestamp('joined_at').notNull().defaultNow()
}, (table) => [
    unique('unique_class_student').on(table.classId, table.studentId)
])
