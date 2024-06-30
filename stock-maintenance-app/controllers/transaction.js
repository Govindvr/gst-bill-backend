const createSucess = require('../utils/sucess');
const createError = require('../utils/error');
const { getProduct } = require('../model/products');
const db = require('../model/transaction');

const addStock = async(req,res,next) => {
    try {
        const id = req.body.id;
        const quantity = req.body.quantity;
        const type = req.body.transaction_type;
        let new_stocks = 0;

        let product =  await getProduct(id);
        product = product[0];


        if(type==="ADD") {
            new_stocks = product.current_stock + quantity;

        } else if (type==="SELL" || type==="LOST" ){
            
            new_stocks = product.current_stock - quantity;
            if(new_stocks<0) {
                next(createError(500,"Invalid Transaction Type Stock Already 0 or less than Quantity"));
                throw new Error("Invalid Transaction Type Stock Already 0 or less than Quantity");
            }

        } else {
            next(createError(500,"Invalid Transaction Type"));
            throw new Error("Invalid Transaction Type");


        }
        const result = await db.addTransaction(id,new_stocks,type,quantity);

        res.status(201).json(createSucess(201,"Added Stock Sucessfully",result));
        
    } catch (error) {
        console.error(error);
        next(createError(500,"server error"));
    }
    
    
}

const viewProductStock = async(req,res,next) => {
    try {
        const id = req.query.id;
        const date = req.query.date;

        let total_sold = 0;
        let total_add = 0;
        let total_lost = 0;

        const result = await db.productReport(id,date);

        result.forEach(row => {
            if(row.transaction_type === 'ADD')
                total_add += row.quantity;
            if(row.transaction_type === 'SELL')
                total_sold += row.quantity;
            if(row.transaction_type === 'LOST')
                total_lost += row.quantity;
        });
        data = {
            total_sold : total_sold,
            total_add : total_add,
            total_lost : total_lost,
            result : result
        }

        res.status(200).json(createSucess(200,"Data Fetched Sucessfully",data));
        
    } catch (error) {
        console.error(error);
        next(createError(500,"server error"));
    }
}

const viewReport  = async(req,res,next) => {
    try {
        const date = req.query.date;
        const data = await db.getReport(date)

        const groupedProducts = {};

        data.forEach(row => {
            const { name,current_stock, ...productDetails } = row;
            if (!groupedProducts[name]) {
                groupedProducts[name] = {
                    "total_sold": 0,
                    "total_add": 0,
                    "total_lost": 0,
                    "current_stock":current_stock,
                    data : []
                };
            }
            groupedProducts[name].data.push(productDetails);
            if(productDetails.transaction_type === 'ADD')
                groupedProducts[name].total_add += productDetails.quantity;
            if(productDetails.transaction_type === 'SELL')
                groupedProducts[name].total_sold += productDetails.quantity;
            if(productDetails.transaction_type === 'LOST')
                groupedProducts[name].total_lost += productDetails.quantity;
        });

        res.status(200).json(createSucess(200,"Data Fetched Sucessfully",groupedProducts));

        
    } catch (error) {
        console.error(error);
        next(createError(500,"server error"));
    }
}

module.exports = {addStock, viewProductStock, viewReport}