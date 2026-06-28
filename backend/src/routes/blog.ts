import { Router } from 'express';
import { BlogController } from '../controllers/BlogController';

const router = Router();
const c = new BlogController();

router.get('/posts', c.listarPosts);
router.get('/posts/:id', c.buscarPost);
router.post('/posts', c.criarPost);
router.get('/galeria', c.listarGaleria);
router.post('/galeria', c.adicionarFoto);

export default router;