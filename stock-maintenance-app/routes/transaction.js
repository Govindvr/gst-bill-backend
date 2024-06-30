const express=require('express');
const router=express.Router();
const transactionController = require('../controllers/transaction');

router.get('/getProductStock',transactionController.viewProductStock);
router.get('/getReport',transactionController.viewReport);
router.post('/addStock',transactionController.addStock);
module.exports = router;