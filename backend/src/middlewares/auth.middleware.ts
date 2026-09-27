import {Request, Response, NextFunction} from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';

import type { AuthUser, Role } from '../types/auth.js';
type AuthMiddleware = (req: Request, res: Response, next: NextFunction,) => Promise<void>;

const requireAuth = (roles: Role[]): AuthMiddleware => { // for closures , no issue type of return is infered (it will still work even without the Authmiddle ware return type mentioned)
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const session = await auth.api.getSession({headers: fromNodeHeaders(req.headers)});//importand type conversion
            if (!session) {
                res.status(401).json({ error: 'Unauthorized'});
                return;
            }
            if (roles.length > 0 && roles.includes(session.user.role as Role)) {//doesn't convert or validate the value at runtime. Treat this value as a Role for type checking.
                res.status(403).json({ error : 'Forbidden'});
                return;
            }
            req.user = session.user as AuthUser; // user type is not explicitly mentioned in express type of Request , hence we define ouself in src/types
            next();
        } catch (err) {
            next(err);
        }
    }
};

export { requireAuth };