const express=require('express');
const router=express.Router();
const productController = require('../controllers/products');

router.get('/getProducts',productController.getProducts);
router.post('/addProduct',productController.addProduct);
module.exports = router;