# VIP FLOW BOT - Backend API

Sistema de automação de vendas no Telegram com agendamento de postagens e métricas.

## 📋 O que é este projeto?

Backend simples e funcional para:
- ✅ Autenticação com JWT
- ✅ Gerenciar fotos e legendas
- ✅ Criar campanhas de marketing
- ✅ Agendar postagens no Telegram
- ✅ Acompanhar métricas de envio

## 🚀 Começando

### 1. Instalar dependências

```bash
npm install
```

Isso vai instalar:
- `express` - Framework web
- `sqlite3` - Banco de dados
- `jsonwebtoken` - Autenticação JWT
- `bcryptjs` - Criptografia de senhas
- `dotenv` - Variáveis de ambiente
- `axios` - Requisições HTTP
- `cors` - Permitir requisições do frontend

### 2. Configurar ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com suas informações:

```
PORT=3000
NODE_ENV=development
DB_PATH=./bot.db
JWT_SECRET=dev_secret_key_change_in_production
TELEGRAM_BOT_TOKEN=seu_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
ADMIN_EMAIL=admin@vipflow.com
ADMIN_PASSWORD=123456
```

### 3. Rodar o servidor

```bash
node server.js
```

Você verá:
```
✅ Banco de dados inicializado com sucesso!
✅ Admin já existe: admin@vipflow.com
✅ Servidor iniciado na porta 3000
📝 Health check: http://localhost:3000/health
```

---

## 📚 Estrutura de pastas

```
vip-flow-bot/
├── src/
│   ├── config/          ← Configurações (banco, JWT)
│   ├── middleware/      ← Autenticação, erros
│   ├── models/          ← Modelos do banco de dados
│   ├── controllers/     ← Lógica das requisições
│   ├── routes/          ← Definição das rotas
│   ├── services/        ← Serviços (Telegram, etc)
│   └── utils/           ← Utilitários (logger, validação)
├── public/
│   └── uploads/         ← Fotos enviadas
├── server.js            ← Entry point
├── package.json
├── .env
└── README.md
```

---

## 🔐 Autenticação

Todas as rotas (exceto `/health` e `/api/auth/login`) requerem autenticação.

**Como funciona:**

1. Faça login e receba um token JWT
2. Inclua o token em todas as requisições:
   ```
   Authorization: Bearer {seu_token_aqui}
   ```

---

## 📡 Rotas da API

### 1. AUTENTICAÇÃO

#### `POST /api/auth/login`
Faz login e retorna token JWT.

**Request:**
```json
{
  "email": "admin@vipflow.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@vipflow.com"
  }
}
```

#### `GET /api/auth/me`
Retorna dados do usuário logado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@vipflow.com",
    "created_at": "2026-05-21 10:30:00",
    "last_login": "2026-05-21 11:45:00",
    "is_active": 1
  }
}
```

---

### 2. FOTOS

#### `GET /api/photos`
Lista fotos do usuário.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "photos": [
    {
      "id": 1,
      "user_id": 1,
      "file_path": "uploads/foto1.jpg",
      "url": "http://localhost:3000/uploads/foto1.jpg",
      "created_at": "2026-05-21 10:30:00"
    }
  ]
}
```

#### `POST /api/photos`
Cria nova foto.

**Request:**
```json
{
  "filePath": "uploads/nova_foto.jpg",
  "url": "http://localhost:3000/uploads/nova_foto.jpg"
}
```

#### `GET /api/photos/:id`
Busca foto específica.

#### `DELETE /api/photos/:id`
Deleta foto.

---

### 3. LEGENDAS

#### `GET /api/captions`
Lista legendas do usuário.

**Query (opcional):**
```
?category=soft
```

**Categorias válidas:**
- `soft` - Chamadas suaves
- `curiosity` - Desperta curiosidade
- `exclusivity` - Exclusividade
- `urgency` - Urgência/Escassez
- `cta` - Call to Action (conversão)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "captions": [
    {
      "id": 1,
      "user_id": 1,
      "text": "Você já conhece nosso conteúdo exclusivo?",
      "category": "curiosity",
      "created_at": "2026-05-21 10:30:00"
    }
  ]
}
```

#### `POST /api/captions`
Cria nova legenda.

**Request:**
```json
{
  "text": "Apenas para membros VIP...",
  "category": "exclusivity"
}
```

#### `PUT /api/captions/:id`
Atualiza legenda.

**Request:**
```json
{
  "text": "Texto atualizado",
  "category": "soft"
}
```

#### `DELETE /api/captions/:id`
Deleta legenda.

---

### 4. CAMPANHAS

#### `GET /api/campaigns`
Lista campanhas do usuário.

**Response:**
```json
{
  "success": true,
  "count": 1,
  "campaigns": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Promoção Verão 2026",
      "status": "active",
      "start_date": "2026-05-21",
      "end_date": "2026-06-21",
      "created_at": "2026-05-21 10:30:00"
    }
  ]
}
```

#### `POST /api/campaigns`
Cria nova campanha.

**Request:**
```json
{
  "name": "Black Friday 2026",
  "startDate": "2026-11-01",
  "endDate": "2026-11-30"
}
```

#### `PUT /api/campaigns/:id`
Atualiza campanha.

#### `PATCH /api/campaigns/:id/status`
Muda status da campanha.

**Request:**
```json
{
  "status": "paused"
}
```

**Status válidos:**
- `active` - Ativa
- `paused` - Pausada
- `completed` - Finalizada

#### `GET /api/campaigns/:id`
Busca campanha específica com total de agendamentos.

#### `DELETE /api/campaigns/:id`
Deleta campanha.

---

### 5. AGENDAMENTOS

#### `GET /api/schedules`
Lista agendamentos de uma campanha.

**Query obrigatória:**
```
?campaignId=1
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "schedules": [
    {
      "id": 1,
      "campaign_id": 1,
      "photo_id": 1,
      "caption_id": 1,
      "link": "https://seu-link.com/converte",
      "scheduled_at": "2026-05-22T10:00:00",
      "sent_at": null,
      "is_sent": 0,
      "created_at": "2026-05-21 10:30:00",
      "file_path": "uploads/foto1.jpg",
      "caption_text": "Seu texto aqui..."
    }
  ]
}
```

#### `POST /api/schedules`
Cria novo agendamento.

**Request:**
```json
{
  "campaignId": 1,
  "photoId": 1,
  "captionId": 1,
  "link": "https://seu-link.com/oferta",
  "scheduledAt": "2026-05-22T15:30:00"
}
```

#### `PUT /api/schedules/:id`
Atualiza agendamento (só se não foi enviado).

**Request:**
```json
{
  "scheduledAt": "2026-05-22T16:00:00",
  "link": "https://novo-link.com"
}
```

#### `DELETE /api/schedules/:id`
Cancela agendamento (só se não foi enviado).

---

### 6. MÉTRICAS

#### `GET /api/metrics/history`
Histórico de publicações.

**Query (opcional):**
```
?limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "history": [
    {
      "id": 1,
      "sent_date": "2026-05-21 10:30:00",
      "status": "sent",
      "error_message": null,
      "link": "https://seu-link.com",
      "caption_text": "Seu texto...",
      "file_path": "uploads/foto1.jpg"
    }
  ]
}
```

#### `GET /api/metrics/stats`
Estatísticas gerais.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSent": 45,
    "totalFailed": 2,
    "totalPending": 8,
    "totalMetrics": 55,
    "successRate": "81.82%"
  }
}
```

#### `GET /api/metrics/errors`
Erros recentes.

**Query (opcional):**
```
?limit=20
```

---

## 🧪 Como testar as rotas

### Opção 1: Usando cURL (Terminal)

**1. Fazer login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vipflow.com","password":"123456"}'
```

Copie o `token` da resposta.

**2. Listar fotos (copie o token):**
```bash
curl -X GET http://localhost:3000/api/photos \
  -H "Authorization: Bearer seu_token_aqui"
```

### Opção 2: Usando Postman

1. Baixe [Postman](https://www.postman.com/downloads/)
2. Crie uma nova requisição
3. Type: `POST`
4. URL: `http://localhost:3000/api/auth/login`
5. Body (JSON):
   ```json
   {"email":"admin@vipflow.com","password":"123456"}
   ```
6. Clique "Send"

---

## ⚠️ Erros comuns e soluções

### Erro: "Port 3000 is already in use"
**Solução:** A porta 3000 já está em uso.
```bash
# Mude a porta no .env
PORT=3001
```

### Erro: "SQLITE_ERROR: UNIQUE constraint failed"
**Solução:** Email já existe. Use outro email ou delete `bot.db`.
```bash
rm bot.db
node server.js
```

### Erro: "Token inválido" ou "Token expirado"
**Solução:** Você precisa fazer login novamente.
```bash
# Faça login e pegue um novo token
POST /api/auth/login
```

### Erro: "Sem permissão para acessar"
**Solução:** Você está tentando acessar dados de outro usuário.

### Erro: "Cannot find module"
**Solução:** Instale as dependências.
```bash
npm install
```

---

## 💡 Dicas importantes

### ✅ Sempre inclua o header de autenticação

Errado:
```bash
curl http://localhost:3000/api/photos
```

Correto:
```bash
curl http://localhost:3000/api/photos \
  -H "Authorization: Bearer seu_token"
```

### ✅ Use datas no formato ISO

Correto:
```json
{
  "scheduledAt": "2026-05-22T15:30:00"
}
```

Errado:
```json
{
  "scheduledAt": "22/05/2026 15:30"
}
```

### ✅ Sempre valide o `success` na resposta

```javascript
if (response.success) {
  // Tudo certo
} else {
  // Erro: response.message tem a mensagem
  console.error(response.message);
}
```

---

## 🔒 Segurança em produção

Antes de colocar em produção:

1. **Mude o JWT_SECRET:**
   ```
   JWT_SECRET=sua_chave_muito_segura_e_aleatória_aqui
   ```

2. **Mude a senha do admin:**
   - Delete `bot.db`
   - Execute `node server.js`
   - Mude `ADMIN_PASSWORD` no `.env`

3. **Use HTTPS** (não HTTP)

4. **Desabilite CORS** ou restrinja a domínios específicos

5. **Adicione rate limiting** (limite de requisições por IP)

---

## 📞 Próximos passos

- [ ] Integrar com Telegram Bot API
- [ ] Implementar upload de arquivos
- [ ] Criar dashboard simples (HTML/CSS/JS)
- [ ] Adicionar validação mais robusta
- [ ] Implementar sistema de retry para envios
- [ ] Adicionar rate limiter

---

**Versão:** 1.0.0  
**Autor:** Fabrício  
**Licença:** MIT
