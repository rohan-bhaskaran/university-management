import { pgTable, serial, text , integer , timestamp} from 'drizzle-orm/pg-core';

export const department = pgTable('department', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow()
})

export const subject = pgTable('subject', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    departmentId: integer('department_id')
    .references(() => department.id, {onDelete : 'cascade'}),
    createdAt: timestamp('created_at').notNull().defaultNow()
})

export const classTable = pgTable('class', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    subjectId: integer('subject_id')
                .references(() => subject.id, {onDelete: 'cascade'}),
    capacity: integer('capacity').notNull(),
    joinCode: text('join_code').notNull().unique(),
    schedule: text('schedule'),
    createdAt: timestamp('created_at').notNull().defaultNow()
})
