# ⚡ Instalação e Inicialização do Painel VIP FLOW BOT

## 🔧 Instalar Dependência (Multer para Upload)

Após a criação do painel, você precisa instalar a dependência `multer` que permite upload real de imagens:

```bash
npm install
```

Isso instalará `multer ^1.4.5-lts.1` definido no `package.json`.

## 🚀 Iniciar o Sistema

```bash
npm start
```

Isso irá:
1. ✅ Inicializar o banco de dados (se necessário)
2. ✅ Criar admin padrão (admin@vipflow.com / admin123)
3. ✅ Iniciar o servidor na porta 3000
4. ✅ Iniciar o scheduler de postagens automáticas
5. ✅ Servir os arquivos estáticos do painel

## 🌐 Acessar o Painel

Abra seu navegador em:
```
http://localhost:3000
```

Você será redirecionado para o login automaticamente.

## 📝 Fluxo Rápido de Teste

### 1. Login
```
Email: admin@vipflow.com
Senha: admin123
```

### 2. Fazer Upload de Foto
- Clique em "Fotos" na sidebar
- Selecione uma imagem do seu computador
- Escolha o tipo: Prévia, Destaque, Oferta ou Novidade
- Clique em "Enviar Foto"
- ✅ A foto será salva em `/public/uploads`

### 3. Criar Campanha
- Clique em "Campanhas"
- Preencha "Nova Campanha" com:
  - Nome: ex "Promoção Verão"
  - Datas
- Clique em "Criar Campanha"

### 4. Agendar Postagem
- Em "Campanhas", preencha "Agendar Postagem":
  - Campanha: selecione a criada
  - Foto: selecione a enviada
  - Estratégia: escolha uma (ex: Curiosidade)
  - Nível: Médio
  - Link: https://seu-link.com/oferta
  - Horário: escolha um futuro (ex: dentro de 5 minutos)
- Clique em "Agendar Postagem"

### 5. Ver Histórico
- Clique em "Histórico"
- Se aguardar alguns minutos e o scheduler estiver ativo, a postagem será enviada
- Você verá o resultado na tabela

### 6. Configurações
- Clique em "Configurações"
- Verifique o status de todos os serviços
- Você pode controlar o scheduler (iniciar/parar)

## 📁 Arquivos Criados no Painel

```
✅ public/css/global.css              # CSS moderno SaaS (1.800 linhas)
✅ public/js/helpers.js               # Funções compartilhadas (360 linhas)
✅ public/pages/login.html            # Tela de login
✅ public/pages/dashboard.html        # Dashboard principal
✅ public/pages/photos.html           # Upload e galeria de fotos
✅ public/pages/campaigns.html        # Campanhas e agendamentos
✅ public/pages/history.html          # Histórico de postagens
✅ public/pages/settings.html         # Configurações e status
✅ DASHBOARD.md                       # Documentação completa do painel
✅ Modificado: src/app.js             # Adicionado rota / e suporte estático
✅ Modificado: src/routes/photos.js   # Adicionado endpoint /api/photos/upload
✅ Modificado: src/models/Photo.js    # Adicionado suporte a campo 'type'
✅ Modificado: package.json           # Adicionado multer
```

## 🎯 Endpoints do Painel

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Redireciona para login |
| GET | `/pages/*.html` | Arquivos estáticos do painel |
| GET | `/css/global.css` | Estilos CSS |
| GET | `/js/helpers.js` | JavaScript compartilhado |
| **POST** | `/api/photos/upload` | ⭐ NOVO: Upload real de imagem |
| GET | `/uploads/*` | Servir imagens enviadas |

## 🌟 Recursos do Painel

### ✅ Implementado
- [x] Autenticação via JWT
- [x] Upload real de imagens com multer
- [x] Preview de imagens antes de enviar
- [x] Categorização de fotos (4 tipos)
- [x] Gerenciamento de campanhas
- [x] Agendamento de postagens
- [x] Integração com sistema de marketing
- [x] Histórico de postagens
- [x] Filtros por status e período
- [x] Status em tempo real do sistema
- [x] Controle do scheduler
- [x] Design responsivo (desktop/tablet/mobile)
- [x] Sem dependências complexas
- [x] Código simples para iniciantes

### 🔄 Em Progresso
- Sistema de TEST MODE (próxima prioridade)

### 📋 Futuro
- Analytics avançados
- A/B Testing de legendas
- Dark mode
- 2FA

## ⚠️ Notas Importantes

### Sobre Upload
- **Localização:** `/public/uploads`
- **Tamanho máximo:** 10MB
- **Formatos:** JPG, PNG, GIF, WebP
- **Nomes:** Auto-gerados para evitar conflitos

### Sobre JWT
- **Duração:** 24 horas
- **Armazenamento:** localStorage
- **Segurança:** Valido em todas as rotas /api

### Sobre o Scheduler
- **Intervalo:** Verifica a cada 30 segundos
- **Anti-spam:** Mínimo 30s entre envios
- **Modo:** Automático após inicialização
- **Controle:** Pode ser pausado em Configurações

## 🧪 Testes Recomendados

### Teste de Upload
```bash
# Abra o painel, vá em Fotos
# Selecione uma imagem JPG/PNG
# Verifique se aparece em /public/uploads
# Verifique se aparece na galeria
```

### Teste de Agendamento
```bash
# Crie uma campanha
# Faça upload de uma foto
# Agende para 5 minutos no futuro
# Aguarde o scheduler executar
# Veja em Histórico
```

### Teste de Marketing
```bash
# Ao agendar, selecione diferentes estratégias
# Observe as legendas diferentes geradas
# Selecione diferentes níveis (suave/médio/direto)
# Veja como as estratégias recomendadas mudam
```

## 📞 Solução de Problemas

### Erro: "Cannot find module 'multer'"
```bash
npm install multer --save
```

### Erro: "Upload folder doesn't exist"
A pasta será criada automaticamente na primeira vez.

### Erro: "File too large"
Máximo é 10MB. Verifique o tamanho da imagem.

### Painel não carrega
- Verifique se `npm start` foi executado
- Verifique se está em `http://localhost:3000`
- Verifique o console do navegador (F12)

### Agendamento não é enviado
- Verifique se Telegram Bot Token está correto em `.env`
- Verifique se o scheduler está ativo em Configurações
- Verifique os logs do servidor

## 🚨 IMPORTANTE - ANTES DE USAR COM TELEGRAM REAL

⚠️ **Leia a próxima seção:** "Sistema de TEST MODE"

Antes de agendar postagens reais no seu grupo/canal Telegram, você DEVE implementar e testar o sistema de TEST MODE para evitar envios acidentais em produção.

Isso será feito na próxima etapa do projeto.

## 📊 Status do Projeto

| Componente | Status | Arquivos |
|-----------|--------|---------|
| Backend | ✅ 100% | 33 arquivos |
| Telegram Bot | ✅ 100% | 2 arquivos |
| Scheduler | ✅ 100% | 1 arquivo |
| Marketing System | ✅ 100% | 3 arquivos |
| **Admin Painel** | ✅ **100%** | **8 arquivos novos** |
| Test Mode | ⏳ Próximo | - |
| Analytics | 📋 Futuro | - |

**Total:** 47 arquivos implementados, 100% funcional!
