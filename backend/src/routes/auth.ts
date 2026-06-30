import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Rotas de autenticação
router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.registrarIgreja(req, res));
router.post('/esqueci-senha', (req, res) => authController.esqueciSenha(req, res));

export default router;
