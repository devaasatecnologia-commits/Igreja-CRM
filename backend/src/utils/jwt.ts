import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET: string = process.env.JWT_SECRET || 'crm_igreja_super_secret_key_2026';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

export interface TokenPayload {
    id: number;
    email: string;
    nivel: string;
    igreja_id: number;
    is_super_admin?: boolean;
}

export function generateToken(payload: TokenPayload): string {
    const options: SignOptions = {
        expiresIn: JWT_EXPIRES as any
    };
    return jwt.sign(payload as object, JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}