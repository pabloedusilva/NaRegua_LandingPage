import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { helmetMiddleware, corsMiddleware, apiLimiter } from './config/security.js';
import { env } from './config/env.js';
import contactRouter from './routes/contact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Em ambiente serverless o diretório de trabalho já é a raiz do projeto
const rootDir = process.cwd();

const app = express();

// Middlewares de segurança
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json());

// Servir arquivos estáticos (CSS, JS, imagens, etc.)
app.use('/css', express.static(path.join(rootDir, 'css')));
app.use('/js', express.static(path.join(rootDir, 'js')));
app.use('/imagens', express.static(path.join(rootDir, 'imagens')));
app.use('/favicon', express.static(path.join(rootDir, 'favicon')));

// Health check da API
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API com rate limiting
app.use('/api', apiLimiter, contactRouter);

// Servir o index.html na rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Handler 404 - diferencia entre API e páginas
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Endpoint não encontrado' });
  } else {
    res.status(404).sendFile(path.join(rootDir, 'index.html'));
  }
});

// Handler de erros
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicia o servidor apenas se não estiver no Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(env.PORT, () => {
    console.log('Servidor rodando.');
  });
}

export default app;
