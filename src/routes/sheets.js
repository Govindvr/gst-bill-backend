const express = require('express');
const router = express.Router();
const sheetsController = require('../controllers/sheets');


router.get('/download', sheetsController.downloadPDF);
router.get('/testgetdata', sheetsController.getSheetData); 
router.post('/setdata', sheetsController.setSheetData);
router.get('/testServer', sheetsController.testServer);

module.exports = router;