const db = require("../db");
const createError = require("../utils/error");

// const listProducts = async () => {

// }

const addProduct = async (data) => {
  try {
    const { rows } = await db.query(
      "INSERT INTO Products (code, name, category, current_stock) VALUES ($1,$2,$3,$4) RETURNING *;",
      [data.code, data.name, data.category, data.current_stock]
    );
    return rows[0];
  } catch (err) {
    console.log(err);
    next(createError(500, "Database Error"));
  }
};

const getProducts = async (data) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM PRODUCTS ORDER BY product_id,CATEGORY;"
    );
    return rows;
  } catch (err) {
    console.error(err);
    throw new Error("Database Error");
  }
};

const getProduct = async (id) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM PRODUCTS WHERE product_id=$1;",
      [id]
    );
    return rows;
  } catch (err) {
    console.log(err);
    next(createError(500, "Database Error"));
  }
};

const listProducts = async (data) => {
  try {
    const { rows } = await db.query(
      "SELECT product_id,name FROM PRODUCTS ORDER BY product_id,CATEGORY;"
    );
    return rows;
  } catch (err) {
    console.error(err);
    throw new Error("Database Error");
  }
};

module.exports = { addProduct, getProducts, getProduct,listProducts };
