import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const auth = new AuthController();

router.post('/login', auth.login);
router.post('/login/superadmin', auth.loginSuperAdmin);
router.post('/registrar', auth.registrarIgreja);
router.post('/esqueci-senha', auth.esqueciSenha);

export default router;