const express = require('express');
const sheetRoutes = require('./src/routes/sheets');
require('dotenv').config();

const app = express ();


app.use(express.json());
app.use('/api/sheets', sheetRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on PORT : ${PORT}`);
    console.log(`View devoplment server at http://localhost:${PORT}/`);
  });
