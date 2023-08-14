const express = require('express');
const router = express.Router();
const sheetsController = require('../controllers/sheets');


router.get('/download', sheetsController.downloadPDF); // Use the correct function name
router.get('/testgetdata', sheetsController.getSheetData); // Use the correct function name

module.exports = router;