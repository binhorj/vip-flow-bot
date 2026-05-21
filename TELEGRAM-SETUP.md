# 📱 Guia de Configuração - Telegram Bot

## 🤖 Passo 1: Criar um Bot no Telegram

### 1.1 Abra o BotFather
1. Abra Telegram
2. Procure por `@BotFather`
3. Clique em "Start"

### 1.2 Criar novo bot
1. Digite `/newbot`
2. BotFather vai pedir um nome (exemplo: "VIPFlowBot")
3. BotFather vai pedir um username (exemplo: "vipflow_bot")
4. Você receberá um **TOKEN** assim:
   ```
   123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   ```

### 1.3 Copiar o token
Copie este token e guarde em algum lugar seguro.

---

## 📍 Passo 2: Obter Chat ID

Existem 3 tipos de chat ID:

### Opção 1: Grupo privado
1. Crie um grupo no Telegram (ou use um existente)
2. Adicione seu bot ao grupo
3. Envie uma mensagem qualquer no grupo
4. Abra no navegador:
   ```
   https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/getUpdates
   ```
   (substitua pelo seu TOKEN)

5. Procure por `"chat":{"id":-123456789}`
6. O Chat ID é o número negativo: `-123456789`

### Opção 2: Canal público
1. Crie um canal no Telegram
2. Adicione seu bot como administrador
3. Envie uma mensagem no canal
4. Use o mesmo método acima
5. Chat ID será algo como: `-100123456789`

### Opção 3: Chat direto (DM com o bot)
1. Procure seu bot no Telegram
2. Envie `/start`
3. Use o método acima
4. Chat ID será um número positivo: `123456789`

---

## 🔑 Passo 3: Configurar no .env

Edite o arquivo `.env`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=-123456789
```

---

## 🧪 Passo 4: Testar a configuração

### 4.1 Validar token

```bash
curl http://localhost:3000/api/telegram/validate
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Token do Telegram é válido",
  "botInfo": {
    "id": 123456789,
    "isBot": true,
    "name": "VIPFlowBot",
    "username": "vipflow_bot"
  }
}
```

### 4.2 Enviar mensagem de teste

```bash
curl -X POST http://localhost:3000/api/telegram/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "-123456789",
    "message": "✅ Teste funcionando!"
  }'
```

Você deve receber a mensagem no Telegram!

### 4.3 Enviar foto de teste

```bash
curl -X POST http://localhost:3000/api/telegram/test-photo \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "-123456789",
    "photoUrl": "https://via.placeholder.com/500x500",
    "caption": "📸 Teste de foto",
    "link": "https://seu-link.com"
  }'
```

---

## 📊 Fluxo completo de teste

### 1. Fazer login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vipflow.com","password":"123456"}'
```

Copie o token retornado.

### 2. Criar foto
```bash
TOKEN="seu_token_aqui"

curl -X POST http://localhost:3000/api/photos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "uploads/foto_teste.jpg",
    "url": "https://via.placeholder.com/500x500"
  }'
```

Copie o `id` retornado (ex: 1).

### 3. Criar legenda
```bash
curl -X POST http://localhost:3000/api/captions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Prévia liberada! Conteúdo completo no VIP",
    "category": "curiosity"
  }'
```

Copie o `id` retornado (ex: 1).

### 4. Criar campanha
```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Telegram",
    "startDate": "2026-05-21",
    "endDate": "2026-06-21"
  }'
```

Copie o `id` retornado (ex: 1).

### 5. Agendar postagem
```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": 1,
    "photoId": 1,
    "captionId": 1,
    "link": "https://seu-link.com/oferta",
    "scheduledAt": "2026-05-21T15:30:00"
  }'
```

Copie o `id` retornado (ex: 1).

### 6. Executar manualmente (para teste)
```bash
curl -X POST http://localhost:3000/api/telegram/schedule/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scheduleId": 1}'
```

A foto deve aparecer no Telegram! 🎉

---

## ⚠️ Erros comuns

### "Token inválido"
**Solução:** Verifique se copiou o token completo no `.env`

### "Chat ID inválido"
**Solução:** Certifique-se de:
1. Adicionar o bot ao grupo/canal
2. Usar o sinal de menos `-` para grupos
3. Usar número sem aspas

### "Bot sem permissão"
**Solução:** Adicione o bot como **administrador** no grupo

### "Bot está silencioso"
**Solução:** Verifique as configurações de privacidade do bot:
```bash
/setprivacy
```

Escolha "Desabilitado" para que o bot receba todas as mensagens.

---

## 🎯 Próximos passos

Após validar tudo:
1. Crie várias fotos de teste
2. Crie legendas em diferentes categorias
3. Agende postagens
4. Deixe o scheduler rodar
5. Verifique se aparecem automaticamente

---

## 📞 Dúvidas?

Se algo não funcionar:
1. Verifique `.env`
2. Reinicie o servidor: `node server.js`
3. Valide o token: `GET /api/telegram/validate`
4. Teste mensagem: `POST /api/telegram/test-message`
