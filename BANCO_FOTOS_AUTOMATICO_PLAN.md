# 🏦 BANCO DE FOTOS AUTOMÁTICO COM CURADORIA INTELIGENTE

**Objetivo**: Sistema que escolhe automaticamente quais fotos usar, em que horário, com que chamada, sem o usuário ter que fazer nada.

---

## 📐 ARQUITETURA GERAL

### Fluxo Macro
```
Usuário coloca fotos em pastas
         ↓
[Botão: Importar Banco de Imagens]
         ↓
Sistema escaneia pastas locais
         ↓
Detecta categoria (pelo nome da pasta)
         ↓
Salva no banco com metadata
         ↓
Cria regras de curadoria
         ↓
Quando agendar → Sistema escolhe automaticamente
         ↓
Qual foto? Qual chamada? Qual horário?
         ↓
Cria agendamentos sozinho
         ↓
Scheduler executa ✅
```

---

## 🗂️ ESTRUTURA DE PASTAS (NO PC DO USUÁRIO)

```
content-bank/
  ├── preview/           (Fotos de prévia, teaser)
  │   ├── girl1.jpg
  │   ├── girl2.jpg
  │   └── ...
  ├── lifestyle/         (Fotos de lifestyle, contexto)
  │   ├── beach.jpg
  │   ├── studio.jpg
  │   └── ...
  ├── destaque/          (Fotos mais chamativas, destaque)
  │   ├── full-body.jpg
  │   ├── special.jpg
  │   └── ...
  ├── vip/               (Fotos exclusivas VIP)
  │   ├── vip1.jpg
  │   └── ...
  └── oferta/            (Fotos com oferta/promo)
      ├── promo1.jpg
      └── ...
```

**Como funciona?**
- Usuário coloca imagens nessas pastas
- Sistema lerá a pasta e usará como categoria
- preview → categoria "preview"
- lifestyle → categoria "lifestyle"
- etc

---

## 🧠 CURADORIA INTELIGENTE

### Regras de Horário (Automático)

```
MANHÃ (6am - 12pm):
  - Foto: lifestyle
  - Legenda: Suave, natural, "bom dia" vibes
  - CTA: Soft ("vem conversar")
  - Estratégia: Aumentar visualizações
  - Exemplo: "Acordei pensando em você..." 

TARDE (12pm - 6pm):
  - Foto: preview
  - Legenda: Curiosidade, teaser
  - CTA: Médio ("clica aqui")
  - Estratégia: Despertar interesse
  - Exemplo: "Você quer ver o resto? 👀"

NOITE (6pm - 11pm):
  - Foto: destaque
  - Legenda: Mais chamativa, ousada
  - CTA: Direto ("acessa agora")
  - Estratégia: Conversão
  - Exemplo: "Exclusivo só pra você! 🔥"

MADRUGADA (11pm - 6am):
  - Foto: vip ou oferta
  - Legenda: Urgência, oferta + CTA
  - CTA: Muito direto ("compra já")
  - Estratégia: Máxima conversão
  - Exemplo: "Oferta válida só essa noite! ⏰"
```

### Seleção de Foto (Automático)

```
Algoritmo de escolha:

1. Nunca usar mesma foto em sequência
   - Se usou foto X hoje, usar Y amanhã
   
2. Priorizar fotos NUNCA usadas
   - Foto nova? Use agora! (boost de variedade)
   
3. Depois usar menos usadas
   - Se todas foram usadas, use a com menor usage_count
   
4. Respeitar cooldown
   - Foto usada hoje? Esperar X dias antes de reusar
   - Foto_usage_count > 5? Cooldown de 7 dias
   
5. Considerar categoria
   - Manhã só lifestyle
   - Tarde só preview
   - Etc (regra acima)
```

### Público-Alvo (Automático)

```
PÚBLICO_NOVO:
  - Objetivo: Apresentar a persona
  - Fotos: preview + lifestyle
  - Legenda: Suave, natural, apresentação
  - CTA: Soft ("vem conhecer")
  - Frequência: 2x/dia (manhã + tarde)

PÚBLICO_QUENTE:
  - Objetivo: Aprofundar interesse
  - Fotos: destaque + teaser
  - Legenda: Curiosidade + ousadia
  - CTA: Médio ("descobre mais")
  - Frequência: 3x/dia (manhã, tarde, noite)

COMPRADORES:
  - Objetivo: Fechar venda
  - Fotos: vip + oferta + destaque
  - Legenda: Prova social + urgência + CTA
  - CTA: Muito direto ("compra agora")
  - Frequência: 4x/dia (todos horários)

MADRUGADA:
  - Objetivo: Máxima conversão
  - Fotos: vip + oferta (melhores)
  - Legenda: Urgência extrema
  - CTA: Claríssimo ("aproveita agora")
  - Frequência: 1x/noite

REATIVACAO:
  - Objetivo: Trazer de volta
  - Fotos: Melhores do portfólio
  - Legenda: Novidade + falta + CTA
  - CTA: "Voltei e trouxe coisa nova!"
  - Frequência: 1x/dia (melhor horário)
```

---

## 💾 BANCO DE DADOS (Migrations)

### Alterações na Tabela `photos`

```sql
ALTER TABLE photos ADD COLUMN source_type VARCHAR(20) DEFAULT 'manual';
-- Valores: 'manual' (upload tradicional), 'bank' (importado do banco)

ALTER TABLE photos ADD COLUMN local_path VARCHAR(500);
-- Caminho local do PC: C:\Users\User\content-bank\preview\girl1.jpg

ALTER TABLE photos ADD COLUMN category VARCHAR(50) DEFAULT 'preview';
-- preview | lifestyle | destaque | vip | oferta

ALTER TABLE photos ADD COLUMN usage_count INTEGER DEFAULT 0;
-- Já existe, apenas garantir que existe

ALTER TABLE photos ADD COLUMN last_used_at DATETIME;
-- Já existe, apenas garantir que existe

ALTER TABLE photos ADD COLUMN cooldown_until DATETIME;
-- Quando essa foto pode ser reutilizada

ALTER TABLE photos ADD COLUMN audience_type VARCHAR(50) DEFAULT 'publico_novo';
-- publico_novo | publico_quente | compradores | madrugada | reativacao
```

### Criar Nova Tabela `campaigns_auto`

```sql
CREATE TABLE campaigns_auto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active | paused | completed
  audience_type VARCHAR(50), -- publico_novo | publico_quente | ...
  posts_per_day INTEGER DEFAULT 2,
  link VARCHAR(500),
  start_date DATETIME,
  end_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
-- Registra campanhas automáticas criadas
```

### Criar Nova Tabela `bank_imports`

```sql
CREATE TABLE bank_imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  folder_path VARCHAR(500),
  files_found INTEGER,
  files_imported INTEGER,
  duplicates_skipped INTEGER,
  errors INTEGER,
  status VARCHAR(20), -- success | partial | error
  FOREIGN KEY(user_id) REFERENCES users(id)
);
-- Registra cada importação feita
```

---

## 🔧 ARQUIVOS A CRIAR/MODIFICAR

### ETAPA 1 (Implementar Agora)

#### Novos Arquivos
1. **src/services/contentBankService.js** (220 linhas)
   - Função para ler pasta local
   - Importar imagens
   - Detectar categoria
   - Evitar duplicadas
   - Salvar no banco

2. **src/routes/contentBank.js** (80 linhas)
   - GET /api/content-bank/stats (estatísticas)
   - POST /api/content-bank/import (disparar importação)
   - GET /api/content-bank/photos (listar fotos do banco)

3. **src/models/ContentBankImport.js** (40 linhas)
   - Model para registro de importações

#### Arquivos Modificados
4. **src/models/Photo.js** (adicionar 3 novos métodos)
   - getBySourceType() - filtrar por origem
   - getByCategory() - filtrar por categoria
   - getByCooldown() - respeitar cooldown

5. **src/config/database.js** (adicionar 3 migrations)
   - Migration para adicionar colunas em photos
   - Migration para criar campaigns_auto
   - Migration para criar bank_imports

6. **server.js** (adicionar 1 linha)
   - Registrar nova rota: `app.use('/api/content-bank', contentBankRoutes);`

#### UI (Etapa 1)
7. **public/pages/dashboard.html** (adicionar botão)
   - Botão "🏦 Importar Banco de Imagens" no dashboard
   - Card com stats do banco (total, por categoria)

---

## 📊 FLUXO ETAPA 1 (Em Detalhe)

### Como Funciona Importação

```javascript
// Usuário clica "Importar Banco de Imagens"
// Sistema faz isso:

1. ESCANEAR PASTAS
   - content-bank/preview/ → [girl1.jpg, girl2.jpg, ...]
   - content-bank/lifestyle/ → [beach.jpg, ...]
   - content-bank/destaque/ → [full-body.jpg, ...]
   - content-bank/vip/ → [vip1.jpg, ...]
   - content-bank/oferta/ → [promo1.jpg, ...]

2. PARA CADA IMAGEM
   a) Verificar se já existe no banco
      - Usar hash ou caminho local como chave
      - Se existe → Skip (evita duplicata)
   
   b) Detectar categoria
      - Pasta "preview/" → category = "preview"
      - Pasta "lifestyle/" → category = "lifestyle"
      - Etc
   
   c) Processar imagem
      - Copiar imagem para /public/uploads/
      - Gerar nome único (Date.now + random)
      - Gerar URL (http://localhost:3000/uploads/...)
      - Gerar thumbnail? (opcional Etapa 2)
   
   d) Salvar no banco (photos table)
      - user_id
      - file_path (/uploads/xyz123.jpg)
      - url (http://localhost:3000/uploads/xyz123.jpg)
      - category (preview | lifestyle | etc)
      - source_type: 'bank' (marcar como importado)
      - local_path: C:\Users\User\content-bank\preview\girl1.jpg
      - type: 'previa' (padrão)
      - usage_count: 0 (nova)
      - last_used_at: NULL
      - cooldown_until: NULL
      - audience_type: 'publico_novo' (padrão)

3. REGISTRAR IMPORTAÇÃO
   - bank_imports table
   - files_found: 15
   - files_imported: 14
   - duplicates_skipped: 1
   - status: 'success'

4. RETORNAR STATS
   - "Importados 14 fotos!"
   - "3 em preview, 5 em lifestyle, 4 em destaque, 2 em vip"
   - "Nenhuma duplicata"
```

### Exemplo de Execução

```
User clica botão → POST /api/content-bank/import
                        ↓
      contentBankService.importPhotos(userId)
                        ↓
      Lê pasta: C:\Users\user\content-bank\
                        ↓
      Encontra 15 imagens
                        ↓
      Para cada uma:
        - Verifica hash (evita duplicata)
        - Detecta categoria
        - Copia para /public/uploads/
        - Salva em photos table com source_type='bank'
        - Registra em bank_imports
                        ↓
      Retorna:
      {
        success: true,
        imported: 14,
        duplicates: 1,
        byCategory: {
          preview: 3,
          lifestyle: 5,
          destaque: 4,
          vip: 2,
          oferta: 0
        }
      }
                        ↓
      UI mostra: "✅ Importadas 14 fotos!"
      Dashboard atualiza stats
```

---

## 🎯 WHAT NÃO MEXER AGORA

❌ Não criar "Campanha Automática" ainda (Etapa 2)  
❌ Não criar curadoria automática de horários (Etapa 2)  
❌ Não criar seleção automática de público (Etapa 2)  
❌ Não criar agendamento automático (Etapa 2)  

**Etapa 1 APENAS:**
✅ Importar fotos da pasta  
✅ Detectar categoria  
✅ Salvar no banco  
✅ Evitar duplicadas  

---

## 🛡️ PROTEÇÕES

✅ Verificar se pasta existe antes de ler  
✅ Tratamento de erros (arquivo corrompido, permissão negada, etc)  
✅ Validar extensões (.jpg, .png, .gif, .webp)  
✅ Limite de tamanho (10MB por imagem, igual upload atual)  
✅ Não perder upload manual (source_type diferencia)  
✅ Hash/caminho evita duplicatas  

---

## 📋 CHECKLIST IMPLEMENTAÇÃO ETAPA 1

- [ ] Criar contentBankService.js
- [ ] Criar contentBank.js route
- [ ] Criar ContentBankImport model
- [ ] Atualizar Photo.js com novos métodos
- [ ] Adicionar migrations em database.js
- [ ] Registrar rota em server.js
- [ ] Adicionar botão no dashboard
- [ ] Adicionar card com stats
- [ ] Testar importação
- [ ] Validar duplicatas
- [ ] Validar categorias
- [ ] Teste com 5-10 imagens

---

## ✨ EXEMPLO PRÁTICO

**Usuário faz isso:**
1. Cria pasta `C:\Users\maria\content-bank\`
2. Cria subpastas: `preview/`, `lifestyle/`, `destaque/`, `vip/`, `oferta/`
3. Coloca 20 fotos nas pastas
4. Abre VIP FLOW BOT
5. Clica "🏦 Importar Banco de Imagens"
6. Sistema lê tudo, importa, detecta categorias
7. Dashboard mostra: "✅ 20 fotos importadas!"
8. Próxima etapa: Sistema escolhe automaticamente qual usar

---

## 🚀 DEPOIS DA ETAPA 1 (Futuro)

Etapa 2: Curadoria + Agendamento Automático
Etapa 3: Dashboard de estatísticas do banco
Etapa 4: Sincronização em tempo real (quando coloca nova foto na pasta)

---

**Pronto para implementar Etapa 1? 🚀**
