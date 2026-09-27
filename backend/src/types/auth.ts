export type Role = 'admin' | 'teacher' | 'student';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}