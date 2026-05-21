# 🤖 Integração Telegram + Scheduler - Documentação Completa

## 🎯 O que foi implementado

### 1. **Telegram Service** (`src/services/telegramService.js`)
- ✅ Enviar mensagens simples
- ✅ Enviar fotos com legenda e link
- ✅ Validar token do bot
- ✅ Sistema anti-spam (cooldown 30s)
- ✅ Tratamento de erros (token inválido, chat inválido)
- ✅ Registra sucesso/erro em métricas

### 2. **Scheduler Service** (`src/services/schedulerService.js`)
- ✅ Busca agendamentos futuros
- ✅ Executa no horário certo (a cada 30s)
- ✅ Não executa agendamentos antigos automaticamente
- ✅ Marca como enviado após sucesso
- ✅ Registra erro se falhar
- ✅ Continua processando mesmo com erros

### 3. **Telegram Routes** (`src/routes/telegram.js`)
- ✅ Validar token: `GET /api/telegram/validate`
- ✅ Testar mensagem: `POST /api/telegram/test-message`
- ✅ Testar foto: `POST /api/telegram/test-photo`
- ✅ Status scheduler: `GET /api/telegram/scheduler/status`
- ✅ Controlar scheduler: `POST /api/telegram/scheduler/start/stop`
- ✅ Executar manual: `POST /api/telegram/schedule/execute`

---

## 🔄 Fluxo de Funcionamento

```
1. Servidor inicia
   ↓
2. Scheduler começa a rodar (verificando a cada 30s)
   ↓
3. Scheduler busca agendamentos com data/hora <= agora
   ↓
4. Para cada agendamento:
   ├─ Verifica cooldown (30s entre mensagens)
   ├─ Envia foto + legenda + link no Telegram
   ├─ Marca como "enviado" no banco
   └─ Registra em métricas (sucesso ou erro)
   ↓
5. Se erro: registra e continua processando próximos
```

---

## 📊 Anti-Spam Implementado

### 1. **Cooldown entre mensagens**
- Mínimo de 30 segundos entre envios
- Evita flood e banimento do bot

### 2. **Não executa agendamentos antigos**
- Só processa agendamentos onde `scheduled_at > CURRENT_TIMESTAMP`
- Se você agendar para "ontem", ele não envia automaticamente

### 3. **Tratamento de erros**
- Se falhar, continua processando próximos
- Registra o erro em métricas
- Não trava o scheduler

---

## 🚀 Como usar

### Passo 1: Configurar .env

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=-123456789
```

Veja `TELEGRAM-SETUP.md` para obter estes valores.

### Passo 2: Iniciar servidor

```bash
node server.js
```

Você verá:
```
✅ Scheduler iniciado - verificando agendamentos a cada 30s
```

### Passo 3: Testar configuração

```bash
curl http://localhost:3000/api/telegram/validate
```

Deve retornar informações do seu bot.

### Passo 4: Criar e agendar postagens

**1. Fazer login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vipflow.com","password":"123456"}'
```

**2. Criar foto:**
```bash
curl -X POST http://localhost:3000/api/photos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "uploads/foto.jpg",
    "url": "https://via.placeholder.com/500x500"
  }'
```

**3. Criar legenda:**
```bash
curl -X POST http://localhost:3000/api/captions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Prévia liberada! 🔥",
    "category": "curiosity"
  }'
```

**4. Criar campanha:**
```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Promoção VIP",
    "startDate": "2026-05-21",
    "endDate": "2026-06-21"
  }'
```

**5. Agendar postagem:**
```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": 1,
    "photoId": 1,
    "captionId": 1,
    "link": "https://seu-link.com",
    "scheduledAt": "2026-05-21T15:30:00"
  }'
```

**Pronto!** Quando chegar a data/hora, o scheduler envia automaticamente.

---

## 🧪 Rotas de Teste

### Teste rápido de mensagem
```bash
curl -X POST http://localhost:3000/api/telegram/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "-123456789",
    "message": "Testando!"
  }'
```

### Teste de foto
```bash
curl -X POST http://localhost:3000/api/telegram/test-photo \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "-123456789",
    "photoUrl": "https://via.placeholder.com/500x500",
    "caption": "Teste de foto",
    "link": "https://seu-link.com"
  }'
```

### Executar agendamento manualmente
```bash
curl -X POST http://localhost:3000/api/telegram/schedule/execute \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scheduleId": 1}'
```

---

## ⚠️ Erros e soluções

### "TELEGRAM_BOT_TOKEN não configurado"
**Solução:** Adicione no `.env`
```
TELEGRAM_BOT_TOKEN=seu_token_aqui
```

### "Token inválido"
**Solução:** Verifique se o token está correto em `.env`

### "Chat ID inválido"
**Solução:** 
- Adicione o bot ao grupo/canal
- Copie o Chat ID correto (com sinal `-`)

### "Bot sem permissão"
**Solução:** Adicione o bot como **administrador**

### "Mensagem não aparece"
**Solução:** 
- Verifique se o bot está no grupo
- Valide o token: `GET /api/telegram/validate`
- Teste mensagem: `POST /api/telegram/test-message`

---

## 📊 Monitorar execução

### Ver status do scheduler
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/telegram/scheduler/status
```

**Resposta:**
```json
{
  "success": true,
  "scheduler": {
    "running": true,
    "message": "Scheduler está ativo"
  }
}
```

### Ver histórico de envios
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/metrics/history
```

Mostra todas as tentativas (enviadas, falhadas, pendentes).

### Ver estatísticas
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/metrics/stats
```

Mostra:
- Total enviado
- Total falhas
- Total pendente
- Taxa de sucesso

---

## 🛡️ Segurança

### ✅ Implementado
- Validação de token
- Validação de chat_id
- Anti-spam (30s entre mensagens)
- Tratamento de erros
- Logs de todas as ações
- Permissões por usuário

### ⚠️ IMPORTANTE
1. Não publique seu `TELEGRAM_BOT_TOKEN` em lugar nenhum
2. Use variáveis de ambiente (`.env`)
3. Não compartilhe o `.env`
4. O token permite CONTROLAR seu bot

---

## 🔧 Personalização

### Mudar intervalo de cooldown
Edite `src/services/telegramService.js`:
```javascript
const MIN_INTERVAL_MS = 30000; // 30 segundos
// Mude para:
const MIN_INTERVAL_MS = 60000; // 60 segundos
```

### Mudar frequência do scheduler
Edite `src/services/schedulerService.js`:
```javascript
schedulerInterval = setInterval(processScheduledPosts, 30000); // A cada 30s
// Mude para:
schedulerInterval = setInterval(processScheduledPosts, 60000); // A cada 60s
```

---

## 📞 Próximos passos

- [ ] Adicionar suporte a múltiplos chats/canais
- [ ] Configurar chat_id por campanha
- [ ] Retry automático em caso de falha
- [ ] Pausa automática se muitos erros
- [ ] Rate limiter global
- [ ] Dashboard para monitorar envios

---

## ✨ Resumo

| Feature | Status |
|---------|--------|
| Enviar mensagens | ✅ Pronto |
| Enviar fotos | ✅ Pronto |
| Scheduler | ✅ Pronto |
| Anti-spam | ✅ Pronto |
| Validação | ✅ Pronto |
| Histórico | ✅ Pronto |
| Estatísticas | ✅ Pronto |

**O sistema está 100% funcional!** 🎉
