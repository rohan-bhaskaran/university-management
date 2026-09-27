import type {Request , Response, NextFunction } from "express";//These are types, not runtime values, so import type makes that explicit and works nicely with TypeScript's type-only import behavior.
import {aj, emailAj} from "../config/arcjet.js";

const protect = async (req:Request , res: Response, next: NextFunction): Promise<void> => {
    try {
        const decision = await aj.protect(req, {requested: 1});
    
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                res.status(429).json({error: 'Too many requests',});
                return;
            }
            if (decision.reason.isBot()) {
                res.status(403).json({error: 'Forbidden',});
                return;
            }
            res.status(403).json({error: 'Forbidden',});
            return;
        }
        next();
    } catch (err) {
        console.log(`Arcjet error ${err}`);
        next(err);
    }
}

const emailValidation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        //smart move , by this we can skip running middlewares for update without email change in new re.body of put
        const email = req.body.email;
        if (!email) {
            next();
            return;
        }

        const decision = await emailAj.protect(req, {email: req.body.email});
        if (decision.isDenied()) {
            res.status(403).json({error: "Cant use disposible or invalid email"});
            return;
        }
       
        next();
    } catch (err) {
        console.log(`Arcjet error ${err}`);
        next(err);
    }
}

export {protect, emailValidation};