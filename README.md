<img width="3240" height="4998" alt="background" src="https://github.com/user-attachments/assets/8e37391a-8a9d-4e5c-ad9d-a79ff8e0c90f" />
<p align="center">
  <a href="https://na-regua-landing-page.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Acessar%20Landing%20Page-%23dbb668?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
</p>

## 🚀 Deploy no Vercel

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta de e-mail configurada com SMTP (Gmail, Outlook, etc.)

### Configuração de Variáveis de Ambiente

No painel do Vercel, configure as seguintes variáveis de ambiente:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-aplicativo
ADMIN_EMAIL=admin@naregua.com
FROM_NAME=Na-Régua
FROM_EMAIL=seu-email@gmail.com
CORS_ORIGIN=https://seu-projeto.vercel.app
```

### Passos para Deploy

1. **Instale a CLI do Vercel** (opcional):
   ```bash
   npm i -g vercel
   ```

2. **Faça login no Vercel**:
   ```bash
   vercel login
   ```

3. **Faça o deploy**:
   ```bash
   vercel
   ```

4. **Configure as variáveis de ambiente** no painel do Vercel em Settings > Environment Variables

5. **Atualize o CORS_ORIGIN** com a URL final do seu projeto

### Estrutura do Projeto

```
.
├── api/
│   └── index.js          # Handler serverless para Vercel
├── server/
│   └── src/
│       ├── config/       # Configurações (env, security)
│       ├── controllers/  # Controladores
│       ├── routes/       # Rotas da API
│       ├── services/     # Serviços (email)
│       ├── mailer.js     # Utilitário de e-mail
│       └── server.js     # Aplicação Express
├── css/
├── js/
├── imagens/
├── index.html
├── package.json
└── vercel.json           # Configuração do Vercel
```

### Endpoints da API

- `GET /health` - Health check do servidor
- `POST /api/contact` - Envio de formulário de contato

### Desenvolvimento Local

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Configure o `.env` na pasta `server/`**:
   ```bash
   cp server/.env.example server/.env
   ```

3. **Edite o arquivo `server/.env`** com suas credenciais

4. **Execute o servidor** (da raiz do projeto):
   ```bash
   npm run dev
   ```

5. **Acesse o site**: `http://localhost:4000`

O servidor servirá:
- **Site**: `http://localhost:4000/`
- **Health Check**: `http://localhost:4000/health`
- **API de Contato**: `POST http://localhost:4000/api/contact`

### Recursos do Servidor

#### 🔒 Segurança
- **Helmet**: Proteção de headers HTTP e CSP
- **CORS**: Controle de origem de requisições
- **Rate Limiting**: 
  - API geral: 10 req/min
  - Contato: 3 req/min
- **Validação**: Zod para validação de dados
- **Sanitização**: Proteção contra XSS

#### 📁 Organização
- Arquitetura MVC limpa
- Separação de concerns
- Código documentado
- Fácil manutenção

#### 📧 E-mail
- Envio automático para admin
- Confirmação para cliente
- Templates HTML responsivos
- Suporte SMTP

### Documentação Adicional

- **[MANUTENCAO.md](server/MANUTENCAO.md)** - Guia completo de manutenção
- **[VERCEL_ENV.md](VERCEL_ENV.md)** - Configuração de variáveis no Vercel


