const express = require('express');
const { getDocumentos, postDocumento } = require('../controllers/documentoController');
const router = express.Router();

router.get('/', getDocumentos);
router.post('/', postDocumento);

module.exports = router;
