const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar upload
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Todas as rotas de fotos requerem autenticação
router.use(authMiddleware);

/**
 * GET /api/photos
 * Lista todas as fotos do usuário
 */
router.get('/', photoController.listPhotos);

/**
 * POST /api/photos
 * Cria nova foto
 * Body: { filePath, url? }
 */
router.post('/', photoController.createPhoto);

/**
 * GET /api/photos/:id
 * Busca foto específica
 */
router.get('/:id', photoController.getPhoto);

/**
 * DELETE /api/photos/:id
 * Deleta foto
 */
router.delete('/:id', photoController.deletePhoto);

/**
 * POST /api/photos/upload
 * Upload de uma ou múltiplas imagens
 * Salva em /public/uploads
 * Form Data: images[] (múltiplas) ou file (compatibilidade), type, category
 */
router.post('/upload', upload.array('images', 50), async (req, res) => {
  try {
    console.log('📤 [UPLOAD] Requisição recebida');
    console.log('📤 [UPLOAD] User ID:', req.user?.userId);

    // Suportar ambas formas: 'images' (múltiplo) e 'file' (compatibilidade)
    const files = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);

    if (files.length === 0) {
      console.error('❌ [UPLOAD] Nenhum arquivo enviado');
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    console.log(`📤 [UPLOAD] ${files.length} arquivo(s) recebido(s)`);

    const type = req.body.type || 'previa';
    const category = req.body.category || 'preview';
    const validCategories = ['preview', 'destaque', 'lifestyle', 'vip'];
    const finalCategory = validCategories.includes(category) ? category : 'preview';

    const userId = req.user.userId;
    const Photo = require('../models/Photo');

    // Processar cada arquivo
    const uploadedPhotos = [];
    const failedFiles = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];

        console.log(`📤 [UPLOAD] Processando ${i + 1}/${files.length}: ${file.originalname}`);
        console.log(`   - Tipo MIME: ${file.mimetype}`);
        console.log(`   - Tamanho: ${file.size} bytes`);

        const filePath = `/uploads/${file.filename}`;
        const url = `http://localhost:3000${filePath}`;

        // Criar foto no banco
        const result = await Photo.create(userId, filePath, url, type);

        // Atualizar categoria
        if (finalCategory !== 'preview') {
          await Photo.updateCategory(result.id, finalCategory);
        }

        console.log(`✅ [UPLOAD] Foto criada! ID: ${result.id}`);

        uploadedPhotos.push({
          id: result.id,
          filePath,
          url,
          type,
          category: finalCategory,
          usage_count: 0
        });

      } catch (fileError) {
        console.error(`❌ [UPLOAD] Erro ao processar ${files[i].originalname}:`, fileError.message);
        failedFiles.push({
          filename: files[i].originalname,
          error: fileError.message
        });
      }
    }

    console.log(`📤 [UPLOAD] Resumo: ${uploadedPhotos.length} sucesso(s), ${failedFiles.length} erro(s)`);

    // Resposta com resultado detalhado
    res.status(201).json({
      success: uploadedPhotos.length > 0,
      message: `${uploadedPhotos.length} foto(s) enviada(s)${failedFiles.length > 0 ? `, ${failedFiles.length} com erro` : ''}`,
      uploaded: uploadedPhotos.length,
      failed: failedFiles.length,
      photos: uploadedPhotos,
      failedFiles: failedFiles.length > 0 ? failedFiles : undefined
    });

  } catch (error) {
    console.error('❌ [UPLOAD] Erro ao fazer upload:', error.message);
    console.error('❌ [UPLOAD] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload: ' + error.message
    });
  }
});

module.exports = router;
