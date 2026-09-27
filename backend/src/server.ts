import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { PORT } from './config/env.js';

//make sure to check if ur ussing the error middleware by end
import { auth } from './lib/auth.js';
import departmentRoutes from './routes/department.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import teacherRoutes from './routes/teachers.routes.js';
import studentRoutes from './routes/student.routes.js';
import classRoutes from './routes/class.routes.js';
import cloudinaryRoutes from './routes/cloudinary.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();

app.all('/api/auth/*splat', toNodeHandler(auth)); //exposing bettwe auths authentication Api POST /api/auth/sign-up/email ,POST /api/auth/sign-in/email ,POST /api/auth/sign-out ,GET  /api/auth/get-sessionendpoints 

app.use(express.json());
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT , () => {
    console.log(`Server up and running`);
})