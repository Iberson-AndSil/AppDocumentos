const express = require('express');
const router = express.Router();
const { getAcepta, postAcepta } = require('../controllers/aceptaController');

router.get('/', getAcepta);
router.post('/', postAcepta);

module.exports = router;
