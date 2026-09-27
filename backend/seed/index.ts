//example trial seed by ai; create s user by better auth only
//note: the seed does no run through express but through direct api calls (auth.api.blahBlah()), so the emails are accepted
import 'dotenv/config';

import { and, eq } from 'drizzle-orm';

import { db } from '../src/database/index.js';
import {
    department,
    subject,
    classTable,
    teacher,
    student,
    classTeacher,
    classStudent,
} from '../src/database/schema/index.js';

import { auth } from '../src/lib/auth.js';


const departmentsData = [
    {
        name: 'Engineering',
    },
    {
        name: 'Arts',
    },
    {
        name: 'Sciences',
    },
];


const subjectsData = [
    {
        name: 'Computer Science',
        department: 'Engineering',
    },
    {
        name: 'Data Structures',
        department: 'Engineering',
    },
    {
        name: 'Database Systems',
        department: 'Engineering',
    },
    {
        name: 'Mechanical Engineering',
        department: 'Engineering',
    },
    {
        name: 'English Literature',
        department: 'Arts',
    },
    {
        name: 'History',
        department: 'Arts',
    },
    {
        name: 'Fine Arts',
        department: 'Arts',
    },
    {
        name: 'Physics',
        department: 'Sciences',
    },
    {
        name: 'Mathematics',
        department: 'Sciences',
    },
];


const teachersData = [
    {
        name: 'Arun Kumar',
        email: 'arun.teacher@example.com',
        subject: 'Computer Science',
    },
    {
        name: 'Priya Sharma',
        email: 'priya.teacher@example.com',
        subject: 'Data Structures',
    },
    {
        name: 'Rahul Menon',
        email: 'rahul.teacher@example.com',
        subject: 'Database Systems',
    },
    {
        name: 'Sneha Nair',
        email: 'sneha.teacher@example.com',
        subject: 'Mechanical Engineering',
    },
    {
        name: 'Vikram Rao',
        email: 'vikram.teacher@example.com',
        subject: 'English Literature',
    },
    {
        name: 'Anjali Singh',
        email: 'anjali.teacher@example.com',
        subject: 'Physics',
    },
];


const studentsData = [
    {
        name: 'Aarav Patel',
        email: 'aarav.student@example.com',
        gradeLevel: 10,
    },
    {
        name: 'Aditya Kumar',
        email: 'aditya.student@example.com',
        gradeLevel: 11,
    },
    {
        name: 'Ananya Sharma',
        email: 'ananya.student@example.com',
        gradeLevel: 12,
    },
    {
        name: 'Diya Nair',
        email: 'diya.student@example.com',
        gradeLevel: 10,
    },
    {
        name: 'Ishaan Rao',
        email: 'ishaan.student@example.com',
        gradeLevel: 11,
    },
    {
        name: 'Kabir Singh',
        email: 'kabir.student@example.com',
        gradeLevel: 12,
    },
    {
        name: 'Meera Iyer',
        email: 'meera.student@example.com',
        gradeLevel: 10,
    },
    {
        name: 'Neha Gupta',
        email: 'neha.student@example.com',
        gradeLevel: 11,
    },
    {
        name: 'Rohan Mehta',
        email: 'rohan.student@example.com',
        gradeLevel: 12,
    },
    {
        name: 'Sara Thomas',
        email: 'sara.student@example.com',
        gradeLevel: 10,
    },
    {
        name: 'Vivek Shah',
        email: 'vivek.student@example.com',
        gradeLevel: 11,
    },
    {
        name: 'Kavya Menon',
        email: 'kavya.student@example.com',
        gradeLevel: 12,
    },
    {
        name: 'Arjun Das',
        email: 'arjun.student@example.com',
        gradeLevel: 10,
    },
    {
        name: 'Nisha Kapoor',
        email: 'nisha.student@example.com',
        gradeLevel: 11,
    },
    {
        name: 'Yash Verma',
        email: 'yash.student@example.com',
        gradeLevel: 12,
    },
    {
        name: 'Pooja Rao',
        email: 'pooja.student@example.com',
        gradeLevel: 10,
    },
    {
        name: 'Karan Joshi',
        email: 'karan.student@example.com',
        gradeLevel: 11,
    },
    {
        name: 'Tanya Roy',
        email: 'tanya.student@example.com',
        gradeLevel: 12,
    },
    {
        name: 'Manav Patel',
        email: 'manav.student@example.com',
        gradeLevel: 10,
    },
    {
        name: 'Isha Kapoor',
        email: 'isha.student@example.com',
        gradeLevel: 11,
    },
];


const classesData = [
    {
        name: 'Computer Science - A',
        subject: 'Computer Science',
        capacity: 30,
        schedule: 'Mon/Wed 10:00-11:30',
    },
    {
        name: 'Computer Science - B',
        subject: 'Computer Science',
        capacity: 30,
        schedule: 'Tue/Thu 10:00-11:30',
    },
    {
        name: 'Data Structures - A',
        subject: 'Data Structures',
        capacity: 30,
        schedule: 'Mon/Wed 12:00-13:30',
    },
    {
        name: 'Data Structures - B',
        subject: 'Data Structures',
        capacity: 30,
        schedule: 'Tue/Thu 12:00-13:30',
    },
    {
        name: 'Database Systems',
        subject: 'Database Systems',
        capacity: 25,
        schedule: 'Mon/Wed 14:00-15:30',
    },
    {
        name: 'Mechanical Engineering',
        subject: 'Mechanical Engineering',
        capacity: 25,
        schedule: 'Tue/Thu 14:00-15:30',
    },
    {
        name: 'English Literature',
        subject: 'English Literature',
        capacity: 30,
        schedule: 'Mon/Wed 09:00-10:30',
    },
    {
        name: 'History',
        subject: 'History',
        capacity: 30,
        schedule: 'Tue/Thu 09:00-10:30',
    },
    {
        name: 'Fine Arts',
        subject: 'Fine Arts',
        capacity: 20,
        schedule: 'Friday 10:00-13:00',
    },
    {
        name: 'Physics',
        subject: 'Physics',
        capacity: 30,
        schedule: 'Mon/Wed 15:00-16:30',
    },
    {
        name: 'Mathematics',
        subject: 'Mathematics',
        capacity: 30,
        schedule: 'Tue/Thu 15:00-16:30',
    },
    {
        name: 'Advanced Mathematics',
        subject: 'Mathematics',
        capacity: 25,
        schedule: 'Friday 14:00-16:00',
    },
];


const generateJoinCode = (): string => {
    return Math.floor(
        100000 + Math.random() * 900000,
    ).toString();
};


const generateUniqueJoinCode = async (): Promise<string> => {
    let joinCode: string;
    let existingClass;

    do {
        joinCode = generateJoinCode();

        [existingClass] = await db
            .select({
                id: classTable.id,
            })
            .from(classTable)
            .where(eq(classTable.joinCode, joinCode));
    } while (existingClass);

    return joinCode;
};


const main = async (): Promise<void> => {
    try {
        console.log('Starting database seed...\n');


        // --------------------------------------------------
        // 1. Departments
        // --------------------------------------------------

        console.log('Creating departments...');

        const departmentMap = new Map<string, number>();

        for (const departmentData of departmentsData) {
            const [existingDepartment] = await db
                .select({
                    id: department.id,
                    name: department.name,
                })
                .from(department)
                .where(eq(department.name, departmentData.name));

            if (existingDepartment) {
                departmentMap.set(
                    existingDepartment.name,
                    existingDepartment.id,
                );

                continue;
            }

            const [newDepartment] = await db
                .insert(department)
                .values({
                    name: departmentData.name,
                })
                .returning({
                    id: department.id,
                    name: department.name,
                });

            departmentMap.set(
                newDepartment.name,
                newDepartment.id,
            );
        }

        console.log(
            `Departments ready: ${departmentMap.size}`,
        );


        // --------------------------------------------------
        // 2. Subjects
        // --------------------------------------------------

        console.log('Creating subjects...');

        const subjectMap = new Map<string, number>();

        for (const subjectData of subjectsData) {
            const departmentId = departmentMap.get(
                subjectData.department,
            );

            if (!departmentId) {
                throw new Error(
                    `Department not found: ${subjectData.department}`,
                );
            }

            const [existingSubject] = await db
                .select({
                    id: subject.id,
                    name: subject.name,
                })
                .from(subject)
                .where(
                    and(
                        eq(subject.name, subjectData.name),
                        eq(
                            subject.departmentId,
                            departmentId,
                        ),
                    ),
                );

            if (existingSubject) {
                subjectMap.set(
                    existingSubject.name,
                    existingSubject.id,
                );

                continue;
            }

            const [newSubject] = await db
                .insert(subject)
                .values({
                    name: subjectData.name,
                    departmentId,
                })
                .returning({
                    id: subject.id,
                    name: subject.name,
                });

            subjectMap.set(
                newSubject.name,
                newSubject.id,
            );
        }

        console.log(
            `Subjects ready: ${subjectMap.size}`,
        );


        // --------------------------------------------------
        // 3. Teachers
        // --------------------------------------------------

        console.log('Creating teachers...');

        const teacherIds: number[] = [];

        for (const teacherData of teachersData) {
            const [existingTeacher] = await db
                .select({
                    id: teacher.id,
                })
                .from(teacher)
                .where(
                    eq(
                        teacher.email,
                        teacherData.email,
                    ),
                );

            if (existingTeacher) {
                teacherIds.push(existingTeacher.id);
                continue;
            }

            const subjectId = subjectMap.get(
                teacherData.subject,
            );

            if (!subjectId) {
                throw new Error(
                    `Subject not found: ${teacherData.subject}`,
                );
            }

            const authUser = await auth.api.createUser({
                body: {
                    name: teacherData.name,
                    email: teacherData.email,
                    password: 'Password123!',
                    role: 'teacher',
                },
            });

            if (!authUser) {
                throw new Error(
                    `Failed to create auth user: ${teacherData.email}`,
                );
            }

            const [newTeacher] = await db
                .insert(teacher)
                .values({
                    userId: authUser.user.id,
                    name: teacherData.name,
                    email: teacherData.email,
                    subjectId,
                })
                .returning({
                    id: teacher.id,
                });

            teacherIds.push(newTeacher.id);
        }

        console.log(
            `Teachers ready: ${teacherIds.length}`,
        );


        // --------------------------------------------------
        // 4. Students
        // --------------------------------------------------

        console.log('Creating students...');

        const studentIds: number[] = [];

        for (const studentData of studentsData) {
            const [existingStudent] = await db
                .select({
                    id: student.id,
                })
                .from(student)
                .where(
                    eq(
                        student.email,
                        studentData.email,
                    ),
                );

            if (existingStudent) {
                studentIds.push(existingStudent.id);
                continue;
            }

            const authUser = await auth.api.createUser({
                body: {
                    name: studentData.name,
                    email: studentData.email,
                    password: 'Password123!',
                    role: 'student',
                },
            });

            if (!authUser) {
                throw new Error(
                    `Failed to create auth user: ${studentData.email}`,
                );
            }

            const [newStudent] = await db
                .insert(student)
                .values({
                    userId: authUser.user.id,
                    name: studentData.name,
                    email: studentData.email,
                    gradeLevel: studentData.gradeLevel,
                })
                .returning({
                    id: student.id,
                });

            studentIds.push(newStudent.id);
        }

        console.log(
            `Students ready: ${studentIds.length}`,
        );


        // --------------------------------------------------
        // 5. Classes
        // --------------------------------------------------

        console.log('Creating classes...');

        const classIds: number[] = [];

        for (const classData of classesData) {
            const subjectId = subjectMap.get(
                classData.subject,
            );

            if (!subjectId) {
                throw new Error(
                    `Subject not found: ${classData.subject}`,
                );
            }

            const [existingClass] = await db
                .select({
                    id: classTable.id,
                })
                .from(classTable)
                .where(
                    eq(
                        classTable.name,
                        classData.name,
                    ),
                );

            if (existingClass) {
                classIds.push(existingClass.id);
                continue;
            }

            const joinCode =
                await generateUniqueJoinCode();

            const [newClass] = await db
                .insert(classTable)
                .values({
                    name: classData.name,
                    subjectId,
                    capacity: classData.capacity,
                    joinCode,
                    schedule: classData.schedule,
                })
                .returning({
                    id: classTable.id,
                });

            classIds.push(newClass.id);
        }

        console.log(
            `Classes ready: ${classIds.length}`,
        );


        // --------------------------------------------------
        // 6. Assign 2 teachers to every class
        // --------------------------------------------------

        console.log(
            'Assigning teachers to classes...',
        );

        for (let i = 0; i < classIds.length; i++) {
            const classId = classIds[i];

            const firstTeacherId =
                teacherIds[i % teacherIds.length];

            const secondTeacherId =
                teacherIds[
                    (i + 1) % teacherIds.length
                ];

            const teacherAssignments = [
                firstTeacherId,
                secondTeacherId,
            ];

            for (const teacherId of teacherAssignments) {
                const [existingAssignment] = await db
                    .select({
                        id: classTeacher.id,
                    })
                    .from(classTeacher)
                    .where(
                        and(
                            eq(
                                classTeacher.classId,
                                classId,
                            ),
                            eq(
                                classTeacher.teacherId,
                                teacherId,
                            ),
                        ),
                    );

                if (existingAssignment) {
                    continue;
                }

                await db
                    .insert(classTeacher)
                    .values({
                        classId,
                        teacherId,
                    });
            }
        }

        console.log(
            'Teacher assignments ready.',
        );


        // --------------------------------------------------
        // 7. Enroll 10-15 students per class
        // --------------------------------------------------

        console.log(
            'Enrolling students into classes...',
        );

        for (let i = 0; i < classIds.length; i++) {
            const classId = classIds[i];

            const studentCount =
                10 + (i % 6);

            for (
                let j = 0;
                j < studentCount;
                j++
            ) {
                const studentId =
                    studentIds[
                        (i + j) % studentIds.length
                    ];

                const [existingEnrollment] =
                    await db
                        .select({
                            id: classStudent.id,
                        })
                        .from(classStudent)
                        .where(
                            and(
                                eq(
                                    classStudent.classId,
                                    classId,
                                ),
                                eq(
                                    classStudent.studentId,
                                    studentId,
                                ),
                            ),
                        );

                if (existingEnrollment) {
                    continue;
                }

                await db
                    .insert(classStudent)
                    .values({
                        classId,
                        studentId,
                    });
            }
        }

        console.log(
            'Student enrollments ready.',
        );


        console.log(
            '\nDatabase seed completed successfully!',
        );

        console.log('\nTest credentials:');
        console.log(
            'Teacher/Student password: Password123!',
        );
    } catch (err) {
        console.error(
            '\nDatabase seed failed:',
            err,
        );

        process.exitCode = 1;
    }
};


main();