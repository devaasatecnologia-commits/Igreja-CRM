import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'aasa-sagrado-secret-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Gerar token JWT
export const generateToken = (payload: any) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verificar token JWT
export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Hash da senha
export const hashPassword = async (senha: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(senha, salt);
};

// Comparar senha
export const comparePassword = async (senha: string, hash: string) => {
    return bcrypt.compare(senha, hash);
};

// Decodificar token sem verificar
export const decodeToken = (token: string) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

export default {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    decodeToken
};
