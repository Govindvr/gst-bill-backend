const db = require('../db');
const createError = require('../utils/error');

// const listProducts = async () => {

// }

const addProduct = async (data) => {
    try {
        const {rows} = await db.query(
            'INSERT INTO Products (code, name, category, current_stock) VALUES ($1,$2,$3,$4) RETURNING *;',
            [data.code,data.name,data.category,data.current_stock]);
        return rows[0];
    } catch(err) {
        console.log(err);
        next(createError(500,"Database Error"));
    }
}

const getProducts = async (data) => {
    try {
        const {rows} = await db.query(
            'SELECT * FROM PRODUCTS ORDER BY CATEGORY;');
        return rows;
    } catch(err) {
        console.log(err);
        next(createError(500,"Database Error"));
    }
}

module.exports = {addProduct, getProducts};
