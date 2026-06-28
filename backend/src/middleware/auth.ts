import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';

// Estende o Request para incluir usuário
declare global {
    namespace Express {
        interface Request {
            usuario?: TokenPayload;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    try {
        const decoded = verifyToken(token);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}

// Middleware para Super Admin
export function superAdminMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.usuario?.is_super_admin) {
        return res.status(403).json({ error: 'Acesso restrito ao Super Admin' });
    }
    next();
}

// Middleware para Admin Master (Matriz)
export function adminMasterMiddleware(req: Request, res: Response, next: NextFunction) {
    const nivel = req.usuario?.nivel;
    if (nivel !== 'ADMIN_MASTER' && nivel !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    next();
}