const db = require("../db");

const addTransaction = async (id, new_stock, type, quantity, balance) => {
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const product = await client.query(
      "UPDATE Products SET current_stock = $1 WHERE product_id = $2 RETURNING name,current_stock;",
      [new_stock, id]
    );

    if (product.rows.length === 0) {
      throw new Error("Product not found or update failed");
    }
    const currentDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour12: false, // 24-hour format
    });
    const query = `
    INSERT INTO Transactions (product_id, transaction_type, quantity, transaction_date, balance_stock, b1, b2, b3)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING transaction_type, quantity;
    `;
    const values = [id, type, quantity, currentDate, new_stock, balance.b1, balance.b2, balance.b3]; // Ensure this array has exactly 5 elements
    const transaction = await client.query(query, values);
    await client.query("COMMIT");
    result = {
      product_name: product.rows[0].name,
      product_stock: product.rows[0].current_stock,
      transaction_type: transaction.rows[0].transaction_type,
      transaction_quantity: transaction.rows[0].quantity,
      balance: new_stock,
    };
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    client.release();
  }
};

const productReport = async (id, date) => {
  try {
    const result = await db.query(
      "SELECT * FROM Transactions WHERE product_id = $1 AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', $2::date) AND DATE_TRUNC('year', transaction_date) = DATE_TRUNC('year', $2::date) ORDER By transaction_date;",
      [id, date]
    );
    return result.rows;
  } catch (error) {
    console.error("Error in transaction:", error);
    throw error;
  }
};

const getReport = async (date) => {
  try {
    const result = await db.query(
      "SELECT * FROM Products,Transactions WHERE Products.product_id = Transactions.product_id AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', $1::date) AND DATE_TRUNC('year', transaction_date) = DATE_TRUNC('year', $1::date) ORDER BY Products.product_id, Transactions.transaction_date;",
      [date]
    );
    return result.rows;
  } catch (error) {
    console.error("Error in transaction:", error);
    throw error;
  }
};

const getBatchBalance = async (id) => {
  try {
    const result = await db.query(
      "SELECT product_id,b1, b2, b3, balance_stock FROM Transactions WHERE product_id = $1 ORDER BY transaction_date DESC LIMIT 1;",
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error in transaction:", error);
    throw error;
  }
};

module.exports = { addTransaction, productReport, getReport, getBatchBalance };
