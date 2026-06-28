import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const router = Router();
const controller = new UsuarioController();

router.post('/login', controller.login);
router.post('/registrar', controller.registrar);
router.get('/perfil', controller.getPerfil);

export { router as usuariosRouter };