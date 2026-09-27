import { createAccessControl } from 'better-auth/plugins/access';
import {defaultStatements, adminAc} from 'better-auth/plugins/admin/access';

const statement = {...defaultStatements} as const;

export const ac = createAccessControl(statement);
export const admin = ac.newRole({...adminAc.statements,});
export const teacher = ac.newRole({});
export const student = ac.newRole({});

//custom role based authorisation config for better auth