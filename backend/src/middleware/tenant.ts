import { Request, Response, NextFunction } from 'express';

// Garante isolamento multi-tenant
export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
    // Super Admin pode ver tudo
    if (req.usuario?.is_super_admin) {
        return next();
    }
    
    // Usuário comum só vê dados da sua igreja
    if (!req.usuario?.igreja_id) {
        return res.status(403).json({ error: 'Igreja não identificada' });
    }
    
    // Adiciona igreja_id automaticamente nas queries
    // Os controllers devem usar req.usuario.igreja_id
    
    next();
}