const {
  findBillIdByYearAndNumber,
  getBillWithItems,
  getSupplierConfig,
} = require('../utils/billLookupService');
const {buildInvoiceHtml, renderPdfBuffer} = require('../utils/pdfService');

const downloadInvoiceByYearAndNumber = async (req, res) => {
  const {year, billNumber} = req.params;

  if (!/^\d{4}$/.test(year)) {
    return res.status(400).json({error: 'year must be a 4-digit number.'});
  }

  try {
    const billId = await findBillIdByYearAndNumber(year, billNumber);
    if (!billId) {
      return res.status(404).json({
        error: `No bill found for ${billNumber} in ${year}.`,
      });
    }

    const bill = await getBillWithItems(billId);
    const supplierConfig = await getSupplierConfig();
    const billItems = bill.billitems || [];

    const html = await buildInvoiceHtml(bill, billItems, supplierConfig);
    const pdfBuffer = await renderPdfBuffer(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${billNumber}_${year}.pdf"`);
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.end(pdfBuffer);
  } catch (error) {
    console.error('Invoice download failed:', error);
    return res.status(500).json({error: 'Failed to generate invoice PDF.'});
  }
};

module.exports = {
  downloadInvoiceByYearAndNumber,
};