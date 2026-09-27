import { admin as adminPlugin } from 'better-auth/plugins';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { fromNodeHeaders } from 'better-auth/node';

import { db } from '../database/index.js';
import * as schema from '../database/schema/auth.js';

import {ac, admin, teacher, student} from './permissions.js';

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema, //Better Auth's Drizzle adapter expects the schema to be passed when you're using a custom schema
    }),

    trustedOrigins: [
        process.env.FRONTEND_URL ||  'http://localhost:5173',
    ],

    plugins: [
        adminPlugin({
            ac,
            roles: {admin, teacher, student}
        }), //the server-side auth.api.createUser() API is provided by Better Auth's Admin plugin, and its documented body requires email, password, name, and can accept role
    ],
});

export const authMiddleware = async (req: any) => {
    return await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
}