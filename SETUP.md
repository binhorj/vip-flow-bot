# 🚀 Guia Rápido de Setup - VIP FLOW BOT

## Primeira Execução

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor:**
   ```bash
   node server.js
   ```

O arquivo `.env` será criado automaticamente baseado em `.env.example`.

---

## ⚙️ Configuração do Telegram

### 1️⃣ Obter TELEGRAM_BOT_TOKEN

1. Abra o Telegram e procure por **@BotFather**
2. Envie: `/newbot`
3. Escolha um nome para o bot (ex: "VIP Flow Bot")
4. Escolha um username único (ex: "vipflow_bot")
5. BotFather enviará um **token** parecido com:
   ```
   1234567890:ABCDefGHijKLmnoPQRstUVWxyz1234567890
   ```
6. **Copie este token completo**

### 2️⃣ Obter TELEGRAM_TEST_CHAT_ID

1. No Telegram, **crie um grupo privado** (ex: "VIP Flow Teste")
2. **Adicione seu bot** ao grupo (procure por @vipflow_bot)
3. **Envie uma mensagem** qualquer no grupo
4. Acesse em seu navegador:
   ```
   https://api.telegram.org/bot<SEU_TOKEN>/getUpdates
   ```
   Substitua `<SEU_TOKEN>` pelo token que copiou acima

5. Procure por `"chat":{"id":XXXXXX}`
6. **Copie apenas os números** (ex: -123456789)

---

## 📝 Editar o Arquivo .env

1. Abra o arquivo `.env` na raiz do projeto
2. **Procure por:**
   ```
   TELEGRAM_BOT_TOKEN=seu_token_do_bot_aqui
   TELEGRAM_TEST_CHAT_ID=seu_chat_id_de_teste_aqui
   TEST_MODE=true
   ```

3. **Substitua pelos valores reais:**
   ```
   TELEGRAM_BOT_TOKEN=1234567890:ABCDefGHijKLmnoPQRstUVWxyz1234567890
   TELEGRAM_TEST_CHAT_ID=-123456789
   TEST_MODE=true
   ```

4. **Salve o arquivo** (Ctrl+S)

---

## ✅ Verificar Configuração

1. **Reinicie o servidor:**
   ```bash
   Pressione Ctrl+C para parar
   node server.js  (para iniciar novamente)
   ```

2. **Você deve ver:**
   ```
   ✅ Configurações validadas com sucesso!
   🧪 SISTEMA EM MODO TESTE
   ✅ Servidor iniciado na porta 3000
   ```

3. **Se houver erros**, as instruções de configuração aparecerão automaticamente

---

## 📱 Acessar o Sistema

1. **Dashboard:**
   ```
   http://localhost:3000/pages/dashboard.html
   ```

2. **Login padrão:**
   - Email: `admin@vipflow.com`
   - Senha: `admin123`

3. **Fluxo completo:**
   - Fotos → Campanhas → Agendamentos → Scheduler → Telegram

---

## 🧪 Modo Teste vs Produção

### Em Modo Teste (TEST_MODE=true)
- ✅ Usa `TELEGRAM_TEST_CHAT_ID`
- ✅ Adiciona prefixo `[TESTE]` nas mensagens
- ✅ Não envia para produção
- ✅ Seguro para aprender

### Em Modo Produção (TEST_MODE=false)
- ⚠️ Usa `TELEGRAM_PRODUCTION_CHAT_ID`
- ⚠️ Envia mensagens reais
- ⚠️ **Apenas depois de testar tudo**

Para mudar:
```
TEST_MODE=true   → TEST_MODE=false
```
Depois reinicie o servidor.

---

## 🐛 Troubleshooting

### "TELEGRAM_BOT_TOKEN não configurado"
- Verifique se copiou o token completo de @BotFather
- Remova espaços extras antes/depois do token

### "TELEGRAM_TEST_CHAT_ID não configurado"
- Acesse: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
- Procure por `"chat":{"id":`
- Use os números com sinal negativo (ex: `-123456789`)

### "O bot não responde no Telegram"
- Verifique se o bot foi adicionado ao grupo
- Envie uma mensagem no grupo
- Atualizo a página: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`

### "Scheduler não envia mensagens"
- Verifique os logs no console do servidor (deve mostrar: `✅ AGENDAMENTO enviado`)
- Confira se o chat_id está correto
- Verifique se o bot foi adicionado ao grupo de teste

---

## 📖 Documentação Completa

Para mais informações, veja:
- `.env.example` - Todas as variáveis disponíveis
- `README.md` - Documentação técnica
- Console do servidor - Logs detalhados

---

## ✨ Pronto!

Você está pronto para:
1. ✅ Fazer upload de fotos
2. ✅ Criar campanhas
3. ✅ Agendar postagens
4. ✅ Testar no Telegram
5. ✅ Validar métricas

**Divirta-se! 🚀**
