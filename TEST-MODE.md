# 🧪 TEST MODE - Proteção contra Envios Acidentais

## ⚠️ CRÍTICO - Leia Antes de Usar

Este documento descreve o sistema de **TEST MODE** que protege seu bot contra:
- ❌ Postar em produção por acidente
- ❌ Flooder o grupo com campanhas
- ❌ Enviar mensagens erradas
- ❌ Testar sem validação

**REGRA DE OURO:** Deixe `TEST_MODE=true` até validar TUDO perfeitamente.

---

## 📝 Configuração

### 1. Atualizar `.env`

Adicione estas variáveis:

```env
# Telegram - Teste (CRIAR GRUPO PRIVADO PARA ISSO)
TELEGRAM_TEST_CHAT_ID=seu_chat_id_de_teste

# Telegram - Produção (SÓ ATIVAR DEPOIS DE TUDO VALIDADO)
TELEGRAM_PRODUCTION_CHAT_ID=seu_chat_id_de_producao

# TEST MODE (DEIXAR true ATÉ TERMINAR TESTES)
TEST_MODE=true
```

---

## 🚀 Como Criar Grupo de Teste

### Passo 1: Criar Grupo Privado
1. Abra Telegram
2. Clique em "+" → "Novo grupo"
3. Adicione você mesmo
4. Nome: "VIP FLOW - TESTES" (ou similar)
5. Deixe privado

### Passo 2: Adicionar Bot ao Grupo
1. Clique em nome do grupo → "Adicionar membro"
2. Procure seu bot pelo username (ex: @seu_bot_name)
3. Clique para adicionar

### Passo 3: Obter Chat ID
1. Envie qualquer mensagem no grupo
2. Coloque seu bot como admin (não obrigatório mas seguro)
3. Abra: `https://api.telegram.org/bot{SEU_TOKEN}/getUpdates`
   - Substitua `{SEU_TOKEN}` com seu token real
4. Procure por `"chat":{"id":-123456789...}` 
5. Copie o ID (começa com `-`)
6. Coloque em `.env` como `TELEGRAM_TEST_CHAT_ID`

**Exemplo:**
```json
"chat": {
  "id": -1001234567890,
  "title": "VIP FLOW - TESTES"
}
```

Copie o ID: `-1001234567890`

---

## 🧪 Comportamento em TEST MODE

### Quando `TEST_MODE=true`

```
✅ ATIVADO:
- Todas as postagens vão para TELEGRAM_TEST_CHAT_ID
- Legenda recebe prefixo [TESTE]
- Logs detalhados no console
- Aviso visual gigante ao iniciar

EXEMPLO DE LEGENDA EM TESTE:
[TESTE] Você nunca viu algo assim... 🔥
```

### Quando `TEST_MODE=false`

```
🔴 AVISO:
- Postagens vão para TELEGRAM_PRODUCTION_CHAT_ID
- Sem prefixo [TESTE]
- Modo real ativado
- Cuidado máximo necessário
```

---

## 📊 Status do Sistema

### Verificar Modo Atual
```bash
curl http://localhost:3000/api/system/status
```

**Resposta:**
```json
{
  "system": {
    "mode": "TEST",
    "testModeActive": true,
    "modeLabel": "🧪 TESTE",
    "warning": "⚠️ Modo de TESTE ativo..."
  },
  "telegram": {
    "botTokenConfigured": true,
    "testChatConfigured": true,
    "currentChatId": "-1001234567890"
  },
  "scheduler": {
    "running": true,
    "status": "✅ Ativo"
  }
}
```

---

## 🔍 Avisos no Console

### Ao Iniciar (TEST MODE)
```
╔═══════════════════════════════════════════════════════╗
║         🧪 SISTEMA EM MODO TESTE                      ║
║  Nenhum envio real será feito em produção             ║
║  Todos os envios irão para TELEGRAM_TEST_CHAT_ID      ║
║                                                       ║
║  ⚠️  Antes de usar em PRODUÇÃO:                       ║
║     1. Testar campanhas completas                    ║
║     2. Validar cooldown anti-spam                    ║
║     3. Validar marketing e métricas                  ║
║     4. Alterar TEST_MODE=false no .env               ║
║     5. Reiniciar o servidor                          ║
╚═══════════════════════════════════════════════════════╝
```

### Ao Enviar (TESTE)
```
⚠️  SISTEMA EM MODO TESTE - Nenhum envio real foi feito em produção
🧪 TESTE | Chat: -1001234567890 | Legenda: [TESTE] Você nunca...
```

---

## 📋 Plano de Testes

### FASE 1: Validação Básica ✅ (Hoje)

**Teste 1: 1 Envio Manual**
```
1. Abra http://localhost:3000
2. Faça login
3. Vá em Configurações
4. Clique "Testar (Executar Agora)"
5. Verifique se apareceu [TESTE] no grupo de teste
6. ✅ Se sim, passe para Teste 2
```

**Teste 2: 3 Agendamentos**
```
1. Fotos → Upload 3 imagens diferentes
2. Campanhas → Crie 1 campanha
3. Agende 3 postagens com 5 min de intervalo
4. Aguarde o scheduler executar
5. Veja que cada uma chegou com [TESTE]
6. ✅ Se sim, passe para Teste 3
```

**Teste 3: Cooldown Anti-Spam**
```
1. Tente agendar 2 postagens com 10 segundos de intervalo
2. Agende ambas
3. A primeira entra OK
4. A segunda deve falhar com "Aguarde 20s"
5. ✅ Cooldown está funcionando
```

### FASE 2: Validação de Marketing ✅ (Próximo)

**Teste 4: Diferentes Estratégias**
```
1. Agende 7 postagens, uma com cada estratégia:
   - Curiosidade
   - Exclusividade
   - Urgência
   - Oferta
   - Novidade
   - Suave
   - CTA
2. Verifique que cada uma tem legenda diferente
3. ✅ Marketing está gerando combos corretos
```

**Teste 5: Histórico e Métricas**
```
1. Após os envios, vá em Histórico
2. Veja todas as 7 postagens listadas
3. Verifique status "Enviado"
4. Veja estatísticas (7 total, 7 sucessos, 0 erros)
5. ✅ Métricas estão corretas
```

### FASE 3: Validação de Frequência ✅ (Próximo)

**Teste 6: Múltiplas Campanhas**
```
1. Crie 2 campanhas diferentes
2. Agende postagens em paralelo
3. Verifique que não há conflito de IDs
4. Confirme que cada campanha tem suas métricas
5. ✅ Sem crosstalk entre campanhas
```

---

## 🔄 Alternando para PRODUÇÃO

### ⚠️ ANTES DE FAZER ISSO:
- [ ] Testes 1-6 passaram com sucesso?
- [ ] Você tem TELEGRAM_PRODUCTION_CHAT_ID configurado?
- [ ] Você adicionou o bot ao grupo/canal de produção?
- [ ] Você tem permissão para postar lá?

### Passos:

1. **Editar `.env`:**
```env
TEST_MODE=false
```

2. **Reiniciar servidor:**
```bash
npm start
```

3. **Verificar modo:**
```bash
curl http://localhost:3000/api/system/status
# Deve retornar "mode": "PRODUCTION"
```

4. **Console mostrará:**
```
╔═══════════════════════════════════════════════════════╗
║         🔴 MODO PRODUÇÃO ATIVO                        ║
║  Envios REAIS serão enviados para Telegram            ║
║  CUIDADO: Verifique tudo antes de iniciar             ║
╚═══════════════════════════════════════════════════════╝
```

5. **Primeiro envio:** Faça 1 agendamento simples para validar
6. **Incremente:** Apenas então aumente frequência

---

## 🚨 Recuperar-se de Erro

### Se Acidentalmente Floodou:

1. **Parar servidor:**
```bash
Ctrl + C (no terminal)
```

2. **Voltar para TESTE:**
```env
TEST_MODE=true
```

3. **Reiniciar:**
```bash
npm start
```

4. **Recuperar:**
   - Deletar campanhas erradas
   - Resetar scheduler em Configurações
   - Validar novamente

---

## 📊 Comparativo TEST vs PRODUCTION

| Aspecto | TEST | PRODUCTION |
|---------|------|-----------|
| Chat Destino | `TELEGRAM_TEST_CHAT_ID` | `TELEGRAM_PRODUCTION_CHAT_ID` |
| Prefixo | [TESTE] adicionado | Sem prefixo |
| Logs | Detalhados no console | Normais |
| Risco | Nenhum (grupo privado) | Máximo (grupo real) |
| Reversível | Sim (é teste) | Não (público) |
| Duração | Até passar nos testes | Indefinido |

---

## 🎯 Checklist Final

Antes de deixar `TEST_MODE=false`:

- [ ] Teste 1: 1 envio manual OK
- [ ] Teste 2: 3 agendamentos OK
- [ ] Teste 3: Cooldown funcionando
- [ ] Teste 4: 7 estratégias diferentes
- [ ] Teste 5: Histórico mostrando corretamente
- [ ] Teste 6: Múltiplas campanhas OK
- [ ] Bot adicionado ao grupo/canal de produção
- [ ] Permissões verificadas
- [ ] TELEGRAM_PRODUCTION_CHAT_ID configurado
- [ ] .env atualizado com `TEST_MODE=false`
- [ ] Servidor reiniciado
- [ ] Status confirmado como PRODUCTION
- [ ] Primeiro envio validado
- [ ] Frequência ajustada

---

## 📞 Troubleshooting

### "Chat ID não configurado"
```
Solução: Verificar .env
- TELEGRAM_TEST_CHAT_ID está preenchido?
- TELEGRAM_PRODUCTION_CHAT_ID está preenchido?
```

### "Bot não consegue postar"
```
Solução:
1. Bot foi adicionado ao grupo?
2. Bot tem permissão para postar?
3. Chat ID está correto? (começa com -)
```

### "Todas as mensagens estão indo para lugar errado"
```
Solução:
1. Checar TEST_MODE no .env
2. Verificar qual chat ID está sendo usado
3. GET /api/system/status mostra qual?
```

### "Preciso resetar tudo"
```
Solução:
1. Abra banco de dados: bot.db
2. DELETE FROM schedules WHERE is_sent = 0;
3. DELETE FROM metrics;
4. Reinicie servidor
```

---

## 🌟 Boas Práticas

1. **Sempre deixe TEST_MODE=true por padrão**
   - Mude para false APENAS quando pronto

2. **Faça testes em grupo privado**
   - Nunca testes em grupo público

3. **Valide antes de escalar**
   - 1 envio → 3 → 7 → mais

4. **Monitore logs constantemente**
   - Especialmente erros
   - console vai avisar tudo

5. **Backup de .env**
   - Mantenha cópia de ambos (teste + produção)

---

## 📌 Lembretes

> ⚠️ **NÃO configure TELEGRAM_PRODUCTION_CHAT_ID até estar 100% seguro**
> 
> 🧪 **Deixe TEST_MODE=true por pelo menos 1 semana de testes**
>
> 🚀 **Quando mudar para produção, comece com frequência BAIXA**
>
> 📊 **Monitore métricas diariamente nos primeiros 7 dias**

---

Parabéns! Você tem agora um sistema **seguro e testável** antes de ir ao ar! 🎉
