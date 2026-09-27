import { pgTable, serial, text , integer , timestamp, check } from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import {user} from './auth.js';
import {subject} from './academics.js';

export const teacher = pgTable('teacher', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().unique()
                .references(() => user.id),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    profilePicture: text('profile_picture'),
    subjectId: integer('subject_id')
                .references(() => subject.id),
    createdAt: timestamp('created_at').notNull().defaultNow()
})

export const student = pgTable('student', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().unique()
                .references(() => user.id),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    profilePicture: text('profile_picture'),
    gradeLevel: integer('grade_level').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => [
    check('grade_check', sql`${table.gradeLevel} >= 1 AND ${table.gradeLevel} <= 12`)
])