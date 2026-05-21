# 📊 Sistema de Variedade de Conteúdo

Implementação de variedade inteligente para evitar repetição de fotos no feed.

## ✨ O que foi implementado

### 1. **Banco de Dados** ✅
Auto-migration automática adiciona 3 campos à tabela `photos`:
- `category` - Categorizar fotos (preview, destaque, lifestyle, vip)
- `usage_count` - Contador de quantas vezes a foto foi usada (0 inicialmente)
- `last_used_at` - Data/hora do último uso (NULL até usar)

Nada de manual - tudo automático no startup!

### 2. **Photo Model** ✅
Novos métodos adicionados:
```javascript
// Registra uso da foto (incrementa contador)
Photo.updateUsage(photoId)

// Busca foto menos usada da categoria
Photo.findLeastUsedByCategory(userId, category, lastPhotosIds)

// Pega últimas 10 fotos usadas (para evitar repetição)
Photo.getLastUsedPhotos(userId, limit)

// Atualiza categoria
Photo.updateCategory(photoId, category)

// Obtém stats da foto
Photo.getStats(photoId)
```

### 3. **Scheduler** ✅
Após enviar post com sucesso:
- Registra uso da foto automaticamente
- Incrementa `usage_count`
- Atualiza `last_used_at`

### 4. **Upload** ✅
Novo campo no formulário:
- Select com 4 categorias: Preview | Destaque | Lifestyle | VIP
- Padrão: Preview
- Validação no backend (aceita apenas as 4 opções)

### 5. **Dashboard** ✅
Cada foto mostra:
- ⭐ Tipo (Prévia, Destaque, etc)
- 👀 Categoria (Preview, Destaque, Lifestyle, VIP)
- 📊 Quantas vezes foi usada (ex: "Usada 3x" ou "Não usada")

## 🧪 Como Testar

### Passo 1: Iniciar o servidor
```bash
cd "bot bubu telegram adulto"
node server.js
```

Você verá:
```
✅ Configurações validadas com sucesso!
🔄 Inicializando banco de dados...
🔄 Verificando schema do banco de dados...
⚙️ Coluna "category" não encontrada em photos, adicionando...
✅ Coluna "category" adicionada com sucesso!
⚙️ Coluna "usage_count" não encontrada em photos, adicionando...
✅ Coluna "usage_count" adicionada com sucesso!
⚙️ Coluna "last_used_at" não encontrada em photos, adicionando...
✅ Coluna "last_used_at" adicionada com sucesso!
```

### Passo 2: Fazer login
- Email: `admin@vipflow.com`
- Senha: `admin123`

### Passo 3: Upload de fotos com categorias
1. Clique em "Fotos" no menu
2. Selecione uma imagem
3. Escolha o tipo (Prévia, Destaque, etc)
4. **Escolha a categoria** (Preview, Destaque, Lifestyle, VIP)
5. Clique "Enviar Foto"

Resultado esperado:
```
✅ Foto enviada com sucesso
📊 Foto X - uso registrado (0 vezes ainda)
```

### Passo 4: Visualizar stats das fotos
Na galeria, cada foto mostra:
- ⭐ Tipo
- 👀 Categoria selecionada
- 📊 "Não usada" (primeira vez)

### Passo 5: Criar campanha e agendar post
1. Clique em "Campanhas"
2. Crie uma nova campanha
3. Agende uma postagem com a foto
4. Defina para enviar agora ou em breve

### Passo 6: Ver uso da foto aumentar
Após envio bem-sucedido:
```
📊 Foto 1 - uso registrado para variedade
✅ Agendamento 1 enviado com sucesso!
```

Na galeria, a foto agora mostra:
```
⭐ Prévia
👀 Destaque
📊 Usada 1x
```

### Passo 7: Enviar múltiplas fotos
1. Upload 5 fotos de diferentes categorias
2. Agende posts para diferentes horários
3. Scheduler executará e incrementará o contador

Resultado final esperado:
```
Foto 1: Usada 3x
Foto 2: Usada 2x
Foto 3: Não usada
Foto 4: Usada 1x
Foto 5: Não usada
```

## 🎯 Fluxo Completo de Variedade

### MVP Validado:
```
1. Upload Foto
   ↓
2. Seleciona Categoria (preview, destaque, lifestyle, vip)
   ↓
3. Cria Campanha
   ↓
4. Agenda Postagem (foto + legenda + link)
   ↓
5. Scheduler Executa
   ↓
6. Registra Uso (usage_count++)
   ↓
7. Atualiza last_used_at
   ↓
8. Métrica atualiza para "sent"
```

### Futuro (Sistema Inteligente):
Quando implementar seleção automática:
```
Selecionar Foto Menos Usada → 
  - Busca foto com menor usage_count
  - Evita últimas 10 fotos usadas
  - Prioriza diferentes categorias
```

## 🔍 Verificar no Banco de Dados

Se quiser ver os dados diretamente:
```sql
SELECT id, category, usage_count, last_used_at FROM photos;
```

Resultado esperado:
```
id | category  | usage_count | last_used_at
---|-----------|-------------|----------------------------
1  | destaque  | 2           | 2026-05-21T10:33:45.123Z
2  | preview   | 0           | NULL
3  | vip       | 1           | 2026-05-21T10:32:10.456Z
4  | lifestyle | 0           | NULL
5  | preview   | 3           | 2026-05-21T10:35:20.789Z
```

## 📝 Logs do Sistema

Procure por esses logs durante testes:

### Upload:
```
📤 [UPLOAD] Category: destaque
```

### Scheduler:
```
📊 Foto 1 - uso registrado para variedade
```

### Variedade:
```
Foto 3 tem usage_count=0, será priorizada
```

## ⚙️ Configurações

### Categorias permitidas:
- `preview` - Prévia/Teaser
- `destaque` - Destaque principal
- `lifestyle` - Conteúdo lifestyle
- `vip` - Conteúdo VIP exclusivo

### Padrão:
- Nova foto = `preview`
- Nova foto = `usage_count = 0`
- Nova foto = `last_used_at = NULL`

## 🚀 Próximos Passos (Futuros)

Com os dados de variedade implementados, será possível:

1. **Auto-seleção de Foto** - Scheduler escolhe automaticamente foto menos usada
2. **Rotação por Categoria** - Alternar entre categorias a cada post
3. **Cooldown por Imagem** - Não usar mesma foto por X dias
4. **Análise Visual** - Detectar imagens similares e evitar repetição
5. **Dashboard Avançado** - Gráficos de uso, categorias mais usadas, etc

## ✅ Validação

- ✅ Banco: Colunas adicionadas automaticamente
- ✅ Upload: Categoria salva corretamente
- ✅ Dashboard: Mostra stats (tipo, categoria, uso)
- ✅ Scheduler: Registra uso após envio
- ✅ Sem quebra: Upload, agendamento e Telegram funcionam normalmente

**Sistema de variedade integrado com sucesso! 🎉**
