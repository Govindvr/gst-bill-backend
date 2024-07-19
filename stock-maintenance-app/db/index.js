const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT || 5432, // Default to 5432 if PGPORT is not set
  database: process.env.PGDATABASE,
  // ssl: {
  //   rejectUnauthorized: false // Adjust as per your SSL requirements
  // },
  // options: `project=${process.env.ENDPOINT_ID}`,
});

async function getPgVersion() {
  try {
    const result = await pool.query('SELECT version()');
    console.log(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
  }
}

getPgVersion();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};
