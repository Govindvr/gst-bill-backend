const express=require('express');
const router=express.Router();
const productController = require('../controllers/products');
const {getBalance} = require('../controllers/transaction')

router.get('/getProducts',productController.getProducts);
router.get('/listProducts',productController.listProducts);
router.post('/addProduct',productController.addProduct);
router.get('/getBalance',getBalance);

module.exports = router;