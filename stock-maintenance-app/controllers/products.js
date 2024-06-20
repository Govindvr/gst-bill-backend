const createSucess = require('../utils/sucess');
const createError = require('../utils/error');
const db = require('../model/products');

const getProducts = async(req,res,next) => {
    try{
        data = await db.getProducts();
        const groupedProducts = {};

        // Iterate through the rows and group by category
        data.forEach(row => {
            const { category, ...productDetails } = row;
            if (!groupedProducts[category]) {
                groupedProducts[category] = [];
            }
            groupedProducts[category].push(productDetails);
        });
        res.status(200).json(createSucess(200,"Result Fetched",groupedProducts));
    }
    catch(err){
        console.log("error");
        next(createError(500,"server error"));
    }
}

const addProduct = async(req,res,next) => {
    try{
        data = req.body;
        row = await db.addProduct(data);
        res.status(201).json(createSucess(201,"Added Sucessfully",row));
    }
    catch(err){
        next(createError(500,"Database Error"));
    }
}

const updateProduct = async(req,res,next) => {
    try{
        res.status(201).json(createSucess(201,"Updated Sucessfully"))
    }
    catch(err){
        console.log("error");
        next(createError(500,"server error"));
    }
}

const deleteProduct = async(req,res,next) => {
    try{
        res.status(201).json(createSucess(201,"Updated Sucessfully"))
    }
    catch(err){
        console.log("error");
        next(createError(500,"server error"));
    }
}

module.exports = {getProducts, addProduct, updateProduct, deleteProduct};