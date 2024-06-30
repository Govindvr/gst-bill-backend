const express = require('express');
const sheetRoutes = require('./src/routes/sheets');
const productRoutes = require('./stock-maintenance-app/routes/products');
const transactionRoutes = require('./stock-maintenance-app/routes/transaction');

const cors = require('cors');
require('dotenv').config();

const app = express ();


app.use(express.json());
app.use(cors());
app.use('/api/sheets', sheetRoutes);
app.use('/api/stock/products', productRoutes);
app.use('/api/stock/transaction', transactionRoutes);

app.use((err,req,res,next)=>{ 
  const errorStatus = err.status|| 500;
  const errorMessage = err.message|| "Something went wrong!";
  res.status(err.status).json({
    success:false,
    status:errorStatus,
    message:errorMessage,
    stack:err.stack, 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on PORT : ${PORT}`);
    console.log(`View devoplment server at http://localhost:${PORT}/`);
  });
