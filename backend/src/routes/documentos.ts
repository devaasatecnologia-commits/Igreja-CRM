import { Router } from 'express';
import { DocumentoController } from '../controllers/DocumentoController';

const router = Router();
const c = new DocumentoController();

router.get('/', c.listar);
router.post('/carteirinha', c.gerarCarteirinha);
router.post('/certificado', c.gerarCertificado);
router.get('/carteirinha/:id/imprimir', c.imprimirCarteirinha);
router.get('/certificado/:id/imprimir', c.imprimirCertificado);
router.get('/validar/:codigo', c.validar);

export default router;