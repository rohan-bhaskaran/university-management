import { relations } from 'drizzle-orm'
import { department, subject, classTable } from './academics.js'
import { teacher, student } from './users.js'
import { classTeacher, classStudent } from './enrollment.js'
import { user } from './auth.js'

// department has many subjects
export const departmentRelations = relations(department, ({ many }) => ({
    subjects: many(subject)
}))

// subject belongs to one department, has many classes
export const subjectRelations = relations(subject, ({ one, many }) => ({
    department: one(department, {
        fields: [subject.departmentId],
        references: [department.id]
    }),
    classes: many(classTable)
}))

// class belongs to one subject, has many teachers and students (through join tables)
export const classRelations = relations(classTable, ({ one, many }) => ({
    subject: one(subject, {
        fields: [classTable.subjectId],
        references: [subject.id]
    }),
    classTeachers: many(classTeacher),
    classStudents: many(classStudent)
}))

// teacher belongs to one user, one subject, has many classes through classTeacher
export const teacherRelations = relations(teacher, ({ one, many }) => ({
    user: one(user, {
        fields: [teacher.userId],
        references: [user.id]
    }),
    subject: one(subject, {
        fields: [teacher.subjectId],
        references: [subject.id]
    }),
    classTeachers: many(classTeacher)
}))

// student belongs to one user, has many classes through classStudent
export const studentRelations = relations(student, ({ one, many }) => ({
    user: one(user, {
        fields: [student.userId],
        references: [user.id]
    }),
    classStudents: many(classStudent)
}))

// classTeacher joins class and teacher
export const classTeacherRelations = relations(classTeacher, ({ one }) => ({
    class: one(classTable, {
        fields: [classTeacher.classId],
        references: [classTable.id]
    }),
    teacher: one(teacher, {
        fields: [classTeacher.teacherId],
        references: [teacher.id]
    })
}))

// classStudent joins class and student
export const classStudentRelations = relations(classStudent, ({ one }) => ({
    class: one(classTable, {
        fields: [classStudent.classId],
        references: [classTable.id]
    }),
    student: one(student, {
        fields: [classStudent.studentId],
        references: [student.id]
    })
}))
