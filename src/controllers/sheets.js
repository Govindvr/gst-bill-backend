const { getAuthToken } = require('../auth/googleSheetsService');
require('dotenv').config();

const sheetId = process.env.SPREADSHEET_ID;
const sheetName = "Sheet1";

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

module.exports = { downloadPDF, getSheetData };