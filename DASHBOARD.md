# 🎨 Painel Administrativo VIP FLOW BOT

## 📁 Estrutura de Arquivos

```
public/
├── css/
│   └── global.css              # Estilos SaaS modernos (responsivo)
├── js/
│   └── helpers.js              # Funções compartilhadas (API, DOM, etc)
└── pages/
    ├── login.html              # Tela de login
    ├── dashboard.html          # Dashboard principal
    ├── photos.html             # Gerenciador de fotos
    ├── campaigns.html          # Criador de campanhas & agendamentos
    ├── history.html            # Histórico de postagens
    └── settings.html           # Configurações do sistema
```

## 🚀 Como Abrir o Painel

### 1. Iniciar o servidor backend
```bash
cd caminho/do/projeto
npm install  # Se não tiver instalado multer
npm start    # Inicia na porta 3000
```

### 2. Abrir no navegador
```
http://localhost:3000
```

Você será redirecionado automaticamente para a tela de login.

## 🔐 Credenciais de Acesso

**Email:** `admin@vipflow.com`
**Senha:** `admin123`

Essas são as credenciais padrão criadas na primeira execução do servidor.

## 📊 Páginas do Painel

### 1. **Login** (`login.html`)
- Autenticação via JWT
- Opção "Lembrar de mim"
- Redirecionamento automático após login
- Exibe credenciais padrão para facilitar testes

### 2. **Dashboard** (`dashboard.html`)
- **Métricas em tempo real:**
  - Campanhas Ativas
  - Agendamentos Pendentes
  - Enviados Hoje
  - Erros Recentes
- **Ações rápidas:**
  - Acessar Fotos
  - Criar Campanha
  - Ver Histórico
- **Próximos Agendamentos:**
  - Tabela com os próximos 5 agendamentos

### 3. **Fotos** (`photos.html`)
- **Upload Real:**
  - Seleciona imagem do computador
  - Preview antes de enviar
  - Categoriza como: Prévia, Destaque, Oferta, Novidade
  - Salva em `/public/uploads`
- **Galeria:**
  - Exibe todas as fotos enviadas
  - Botão para deletar
  - Grid responsivo com thumbnails

### 4. **Campanhas** (`campaigns.html`)
- **Nova Campanha:**
  - Nome da campanha
  - Data de início e encerramento
  - Criar campanha
- **Agendar Postagem:**
  - Selecionar campanha
  - Selecionar foto
  - Escolher estratégia de marketing (7 opções)
  - Definir nível de chamada (Suave, Médio, Direto)
  - Adicionar link de conversão
  - Agendar data/hora
- **Visualização:**
  - Campanhas ativas com status
  - Agendamentos pendentes
  - Botões para pausar/ativar/deletar

### 5. **Histórico** (`history.html`)
- **Filtros:**
  - Por Status (Todos, Enviados, Erros)
  - Por Período (7d, 30d, 90d, tudo)
- **Estatísticas:**
  - Total enviado
  - Sucessos
  - Erros
  - Taxa de sucesso %
- **Tabela de Detalhes:**
  - Data/hora
  - Campanha
  - Estratégia usada
  - Status
  - Mensagem de erro (se houver)

### 6. **Configurações** (`settings.html`)
- **Status do Sistema:**
  - API Status
  - Telegram Bot
  - Scheduler
  - Banco de Dados
- **Controle do Scheduler:**
  - Iniciar scheduler
  - Parar scheduler
  - Testar (executar agora)
- **Informações:**
  - Versão, ambiente, porta
  - Node.js version
  - Última atualização

## 🎨 Design do Painel

- **Tema:** SaaS moderno com gradientes roxos
- **Layout:** Sidebar navegável + conteúdo principal
- **Responsivo:** Funciona em desktop, tablet e mobile
- **Cores:**
  - Primária: `#7c3aed` (roxo)
  - Sucesso: `#10b981` (verde)
  - Perigo: `#ef4444` (vermelho)
  - Aviso: `#f59e0b` (amarelo)

## 🧪 Como Testar

### Teste 1: Login
1. Abra http://localhost:3000
2. Use as credenciais padrão
3. Clique em "Entrar"
4. Você deve ser redirecionado para o dashboard

### Teste 2: Upload de Foto
1. Clique em "Fotos" na sidebar
2. Selecione uma imagem do seu computador
3. Veja o preview
4. Escolha o tipo (Prévia, Destaque, Oferta, Novidade)
5. Clique em "Enviar Foto"
6. A foto deve aparecer na galeria

### Teste 3: Criar Campanha
1. Clique em "Campanhas" na sidebar
2. Preencha "Nova Campanha"
3. Clique em "Criar Campanha"
4. Você deve ver a campanha na lista

### Teste 4: Agendar Postagem
1. Clique em "Campanhas"
2. Certifique-se que tem fotos e campanhas criadas
3. Preencha "Agendar Postagem":
   - Selecione campanha
   - Selecione foto
   - Escolha estratégia (ex: Curiosidade)
   - Nível: Médio
   - Link: https://seu-link.com/oferta
   - Horário: Data/hora futura
4. Clique em "Agendar Postagem"
5. Você deve ver o agendamento na lista "Agendamentos Pendentes"

### Teste 5: Ver Histórico
1. Clique em "Histórico"
2. Você pode filtrar por status e período
3. Veja as postagens já enviadas

### Teste 6: Verificar Status do Sistema
1. Clique em "Configurações"
2. Veja o status de todos os serviços
3. Você pode iniciar/parar o scheduler

## 🔌 API Endpoints Utilizados

O painel consome os seguintes endpoints da API:

```
POST   /api/auth/login              # Login
GET    /api/auth/me                 # Dados do usuário logado

GET    /api/photos                  # Listar fotos
POST   /api/photos/upload           # Upload de foto
DELETE /api/photos/:id              # Deletar foto

POST   /api/campaigns               # Criar campanha
GET    /api/campaigns               # Listar campanhas
PATCH  /api/campaigns/:id/status    # Mudar status

POST   /api/schedules               # Agendar
GET    /api/schedules               # Listar agendamentos
DELETE /api/schedules/:id           # Cancelar agendamento

GET    /api/metrics/history         # Histórico
GET    /api/metrics/stats           # Estatísticas

GET    /api/marketing/generate-combo # Gerar combo automático

GET    /health                       # Status do sistema
GET    /api/telegram/validate        # Validar Telegram
POST   /api/telegram/scheduler/start # Iniciar scheduler
POST   /api/telegram/scheduler/stop  # Parar scheduler
```

## 📱 Responsividade

O painel é totalmente responsivo:

- **Desktop:** Layout sidebar + conteúdo
- **Tablet:** Sidebar horizontal, conteúdo principal
- **Mobile:** Sidebar colapsável, menu horizontal

## 🛡️ Segurança

- JWT authentication em todas as rotas
- Token salvo em `localStorage`
- Logout limpa os dados locais
- CORS habilitado para requisições do painel
- Validação de tipo de arquivo no upload

## 🚨 Erros Comuns

### "Erro ao conectar com servidor"
- Verifique se o backend está rodando: `npm start`
- Verifique se está na porta 3000

### "Token expirado"
- Faça login novamente
- O token tem duração de 24 horas

### "Foto não foi enviada"
- Verifique se selecionou uma imagem
- Verifique o tamanho (máximo 10MB)
- Formatos permitidos: JPG, PNG, GIF, WebP

### "Sem permissão"
- Verifique se você é o proprietário da foto/campanha
- O sistema isola dados por usuário

## 📊 Próximos Recursos (Futuro)

- [ ] Analytics avançados (qual legenda converte mais)
- [ ] A/B Testing de legendas
- [ ] Análise de melhor horário para postar
- [ ] Exportar relatórios em PDF
- [ ] Dark mode
- [ ] 2FA (autenticação de dois fatores)
- [ ] Integração com Google Analytics
- [ ] Backup automático
