const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

const dbPath = process.env.DB_PATH || './bot.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    logger.info('Conectado ao SQLite:', dbPath);
  }
});

// Habilita foreign keys
db.run('PRAGMA foreign_keys = ON');

// Função para executar queries com Promise
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        logger.error('Erro ao executar query:', err.message);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Função para buscar dados com Promise
const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        logger.error('Erro ao buscar dados:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Função para buscar múltiplas linhas
const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        logger.error('Erro ao buscar múltiplos dados:', err.message);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

// Verificar se coluna existe em uma tabela
const columnExists = (tableName, columnName) => {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const exists = rows && rows.some(row => row.name === columnName);
        resolve(exists);
      }
    });
  });
};

// Executar migrations automáticas
const runMigrations = async () => {
  try {
    logger.info('🔄 Verificando schema do banco de dados...');

    // Verificar e adicionar coluna 'type' na tabela 'photos'
    const typeColumnExists = await columnExists('photos', 'type');
    if (!typeColumnExists) {
      logger.info('⚙️ Coluna "type" não encontrada em photos, adicionando...');
      await runQuery('ALTER TABLE photos ADD COLUMN type TEXT DEFAULT \'previa\'');
      logger.info('✅ Coluna "type" adicionada com sucesso!');
    }

    // Verificar e adicionar coluna 'category' para variedade de conteúdo
    const categoryColumnExists = await columnExists('photos', 'category');
    if (!categoryColumnExists) {
      logger.info('⚙️ Coluna "category" não encontrada em photos, adicionando...');
      await runQuery('ALTER TABLE photos ADD COLUMN category TEXT DEFAULT \'preview\'');
      logger.info('✅ Coluna "category" adicionada com sucesso!');
    }

    // Verificar e adicionar coluna 'usage_count' para rastrear uso
    const usageCountColumnExists = await columnExists('photos', 'usage_count');
    if (!usageCountColumnExists) {
      logger.info('⚙️ Coluna "usage_count" não encontrada em photos, adicionando...');
      await runQuery('ALTER TABLE photos ADD COLUMN usage_count INTEGER DEFAULT 0');
      logger.info('✅ Coluna "usage_count" adicionada com sucesso!');
    }

    // Verificar e adicionar coluna 'last_used_at' para rastrear último uso
    const lastUsedColumnExists = await columnExists('photos', 'last_used_at');
    if (!lastUsedColumnExists) {
      logger.info('⚙️ Coluna "last_used_at" não encontrada em photos, adicionando...');
      await runQuery('ALTER TABLE photos ADD COLUMN last_used_at DATETIME');
      logger.info('✅ Coluna "last_used_at" adicionada com sucesso!');
    }

    logger.info('✅ Schema atualizado com sucesso!');

  } catch (error) {
    logger.error('❌ Erro ao executar migrations:', error.message);
    // Não interrompe o sistema se houver erro em migration
  }
};

// Criar tabelas se não existirem
const initializeDatabase = async () => {
  try {
    logger.info('Inicializando banco de dados...');

    // Tabela de usuários
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1
      )
    `);

    // Tabela de fotos
    await runQuery(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        url TEXT,
        type TEXT DEFAULT 'previa',
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tabela de legendas
    await runQuery(`
      CREATE TABLE IF NOT EXISTS captions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        category TEXT DEFAULT 'soft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tabela de campanhas
    await runQuery(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        start_date DATETIME,
        end_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tabela de agendamentos
    await runQuery(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        photo_id INTEGER NOT NULL,
        caption_id INTEGER NOT NULL,
        link TEXT NOT NULL,
        scheduled_at DATETIME NOT NULL,
        sent_at DATETIME,
        is_sent BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
        FOREIGN KEY (caption_id) REFERENCES captions(id) ON DELETE CASCADE
      )
    `);

    // Tabela de métricas
    await runQuery(`
      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        schedule_id INTEGER NOT NULL,
        sent_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
      )
    `);

    logger.info('✅ Banco de dados inicializado com sucesso!');

    // Executar migrations automáticas
    await runMigrations();

  } catch (error) {
    logger.error('❌ Erro ao inicializar banco de dados:', error.message);
    process.exit(1);
  }
};

module.exports = {
  db,
  runQuery,
  getQuery,
  allQuery,
  initializeDatabase,
  runMigrations,
  columnExists
};
