const db = require('../db');
const createError = require('../utils/error');

const addTransaction = async (id,new_stock,type,quantity) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const product = await client.query(
            'UPDATE Products SET current_stock = $1 WHERE product_id = $2 RETURNING name,current_stock;',
            [new_stock,id]
        );

        if (product.rows.length === 0) {
            throw new Error('Product not found or update failed');
        }

        const transaction = await client.query(
            'INSERT INTO Transactions (product_id, transaction_type, quantity, balance_stock) VALUES ($1, $2, $3, $4) RETURNING transaction_type, quantity;',
            [id,type,quantity,new_stock]
        );
        await client.query('COMMIT');
        result =  {
            product_name: product.rows[0].name,
            product_stock: product.rows[0].current_stock,
            transaction_type: transaction.rows[0].transaction_type,
            transaction_quantity: transaction.rows[0].quantity
        };
        return result;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in transaction:', error);
        throw error;

    } finally {
        client.release();
    }
}

const productReport = async(id,date) => {
    try {
        const result = await db.query(
            "SELECT * FROM Transactions WHERE product_id = $1 AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', $2::date) AND DATE_TRUNC('year', transaction_date) = DATE_TRUNC('year', $2::date) ORDER By transaction_date;",
            [id,date]
        );
        return result.rows;
    } catch (error) {
        console.error('Error in transaction:', error);
        throw error;
    }
}

const getReport = async(date) => {
    try {
        const result = await db.query(
            "SELECT * FROM Products,Transactions WHERE Products.product_id = Transactions.product_id AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', $1::date) AND DATE_TRUNC('year', transaction_date) = DATE_TRUNC('year', $1::date) ORDER BY Products.name, Transactions.transaction_date;",
            [date]
        );
        return result.rows;
    } catch (error) {
        console.error('Error in transaction:', error);
        throw error;
    }
}

module.exports = {addTransaction, productReport, getReport}