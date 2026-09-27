import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

const error = (err: unknown, req: Request, res: Response, next: NextFunction,): void => {
    console.error(err);
     if (err instanceof ZodError) {
        res.status(400).json({message: 'Invalid input', errors: err.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
     } else if (isDatabaseError(err) && err.code === '23505') { //unique_violation
        res.status(409).json({
            message: 'Duplicate value',
            error: err.detail ?? 'A record with this value already exists',
        });
    } else if (isDatabaseError(err) && err.code === '23503') {//foreign_key_violation
        res.status(400).json({
            message: 'Invalid reference',
            error: err.detail ?? 'Referenced record does not exist',
        });
    } else if (isCloudinaryError(err)) {
        res.status(500).json({
            message: 'File upload failed',
        });
    } else {
        res.status(500).json({
            message: 'Server Error',
        });
    }
};

const isDatabaseError = (err: unknown,): err is {code: string; detail?: string;} => {//type unkown is more safer than any cause unknow is to say "not known yet!!"
    return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        typeof err.code === 'string'
    );
};

const isCloudinaryError = (err: unknown,): err is {message?: string; http_code?: number;} => {//understand this type parsing, its beautifull
    return (
        typeof err === 'object' &&
        err !== null &&
        ('http_code' in err || 'error' in err) &&
        'message' in err
    );
};

export default error;