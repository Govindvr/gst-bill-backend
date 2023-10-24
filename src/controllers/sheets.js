const { getAuthToken } = require('../auth/googleSheetsService');
const { numInWords } = require('../utils/convert');
require('dotenv').config();

const sheetId = process.env.SPREADSHEET_ID;
const sheetName = "Sheet1";

const testServer = async (req, res) => {
    try {
        data = {
            "status": "success",
        };
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

const downloadPDF = async (req, res) => {
    try {
        console.log('downLoadPDF');
        data = {
            "status": "success",
        };
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};

const getSheetData = async (req, res) => {
    try {
        const { sheets } = await getAuthToken();
        const getRows = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: sheetName,
        });
        res.json(getRows.data);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};
const setSheetData = async (req, res) => {
    try {
        const { sheets } = await getAuthToken();
        const billingAddress = req.body.bill.customer_name + "\n" +
                            req.body.bill.billing_address + "\n" + 
                            "GSTIN: " + req.body.bill.customer_gst + "\n" + 
                            "Phone: " + req.body.bill.customer_phone;
        const invoiceNo = (req.body.bill.invoice_number).toString().padStart(4, '0');
        const date = req.body.bill.date.split('-').reverse().join('-');

        var products = [];

        req.body.products.forEach((product,i) => {
            products.push([
                i+1,product.product_name,"",
                product.hsn_sac, product.gst_rate, 
                product.quantity, product.unit, 
                product.unitprice,product.disc,
                product.item_total
            ]);
        });

        if (products.length < 15) {
            for (let i = products.length; i < 15; i++) {
                products.push(["","","","","","","","","",""]);
            }
        }

        // Entering the date and invoice number
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: sheetName+"!H5:J6",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    [`${invoiceNo}`],
                    [`${date}`]
                ],
            },
        });

        // Entering the billing address
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: sheetName+"!A10:E12",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    [`${billingAddress}`],
                ],
            },
        });

        // Entering the shipping address
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: sheetName+"!F10:J12",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    [`${req.body.bill.shipping_address}`],
                ],
            },
        });

        // Entering the products details
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: sheetName+"!A14:J28",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: products,
            },
        });

        // Get grand total
        let grandTotal = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: sheetName+"!I34:J34",
        });
        grandTotal = parseInt(grandTotal.data.values[0][0].slice(1).replace(',',''));

        // Entering the grand total words
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: sheetName+"!D35:J35",
            valueInputOption: "USER_ENTERED",
            resource: {
                values:[
                    [`${numInWords(grandTotal)}`]
                ],
            },
        });

        
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
    data = {
        "message":"Invoice generated successfully."
        };
        res.status(201).json(data)
};

module.exports = { downloadPDF, getSheetData, setSheetData, testServer };