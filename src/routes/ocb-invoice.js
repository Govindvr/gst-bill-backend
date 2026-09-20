const express = require('express');
const ocbInvoiceController = require('../controllers/ocb-invoice');

const router = express.Router();

router.get(
  '/:year/:billNumber/download',
  ocbInvoiceController.downloadInvoiceByYearAndNumber,
);

module.exports = router;