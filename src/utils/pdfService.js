const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const {formatCurrency, getStateName, toIndianWords} = require('./gstCalculations');

const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'gst_invoice.html');
const ROW_START = '<!-- START DYNAMIC PRODUCT ROW LOOP IN REACT NATIVE -->';
const ROW_END = '<!-- END DYNAMIC PRODUCT ROW LOOP -->';
const UPI_VPA = '9020411611@upi';
const UPI_NAME = 'OLGA CONCRETE BLOCKS';
const logoPath = path.join(__dirname, '..', 'templates', 'ocb-logo.png');
const logoBase64 = fsSync.readFileSync(logoPath).toString('base64');
const logoDataUri = `data:image/png;base64,${logoBase64}`;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildItemRows(items) {
  return items
    .map(
      (item, i) => `
        <tr>
          <td class="br text-center align-top pt-2">${i + 1}</td>
          <td class="br align-top pt-2">${escapeHtml(item.product_name)}</td>
          <td class="br text-center align-top pt-2">${escapeHtml(item.hsn_sac)}</td>
          <td class="br text-center align-top pt-2">${escapeHtml(item.gst_rate)}</td>
          <td class="br text-center align-top pt-2">${escapeHtml(item.quantity)}</td>
          <td class="br text-center align-top pt-2">${escapeHtml(item.unit)}</td>
          <td class="br text-right align-top pt-2">${formatCurrency(item.unitprice)}</td>
          <td class="br text-center align-top pt-2">${escapeHtml(item.disc ?? 0)}</td>
          <td class="text-right align-top pt-2">${formatCurrency(item.pregstprice)}</td>
        </tr>`,
    )
    .join('');
}

function injectRows(template, rowsHtml) {
  const pattern = new RegExp(`${escapeRegExp(ROW_START)}[\\s\\S]*?${escapeRegExp(ROW_END)}`, 'm');
  return template.replace(pattern, `${ROW_START}\n${rowsHtml}\n${ROW_END}`);
}

function applyValues(template, values) {
  return Object.entries(values).reduce(
    (html, [key, value]) => html.replace(new RegExp(escapeRegExp(`{{${key}}}`), 'g'), value),
    template,
  );
}

async function generateUpiQrDataUrl(amount) {
  const upiPayload = `upi://pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent(
    UPI_NAME,
  )}&am=${Number(amount || 0).toFixed(2)}&cu=INR`;
  return QRCode.toDataURL(upiPayload, {errorCorrectionLevel: 'M', margin: 1, width: 300});
}

async function buildInvoiceHtml(bill, billItems, supplierConfig) {
  const totalExclGst = Number(bill.total_excl_gst ?? bill.total ?? 0);
  const cgst = Number(bill.cgst_total ?? bill.cgst ?? 0);
  const sgst = Number(bill.sgst_total ?? bill.sgst ?? 0);
  const igst = Number(bill.igst_total ?? bill.igst ?? 0);
  const totalInclGst = Number(bill.total_incl_gst ?? bill.grand_total ?? 0);
  const roundOffAmount = totalExclGst + cgst + sgst + igst - totalInclGst;

  const qrDataUrl = await generateUpiQrDataUrl(totalInclGst);
  const template = await fs.readFile(TEMPLATE_PATH, 'utf8');
  const rowsHtml = buildItemRows(billItems);

  return applyValues(injectRows(template, rowsHtml), {
    LOGO_IMAGE_DATA_URI: logoDataUri,
    INVOICE_NO: escapeHtml(bill.invoice_number),
    INVOICE_DATE: escapeHtml(bill.date),
    PLACE_OF_SUPPLY: escapeHtml(getStateName(bill.place_of_supply_state)),
    INVOICE_TYPE: escapeHtml(bill.bill_kind || ''),
    BILLING_NAME: escapeHtml(bill.customer_name || 'Customer Name'),
    BILLING_ADDRESS: escapeHtml(bill.billing_address || ''),
    BILLING_GSTIN: escapeHtml(bill.customer_gst || ''),
    BILLING_PHONE: escapeHtml(bill.customer_phone || ''),
    SHIPPING_ADDRESS: escapeHtml(bill.shipping_address || ''),
    BANK_AC_NAME: escapeHtml(supplierConfig?.legal_business_name || 'OLGA CONCRETE BLOCKS'),
    BANK_NAME: escapeHtml(supplierConfig?.business_name || 'Indian Bank'),
    BANK_BRANCH: escapeHtml(supplierConfig?.branch_name || 'Thycaud'),
    BANK_AC_NO: escapeHtml(supplierConfig?.account_number || '8347203408'),
    BANK_IFSC: escapeHtml(supplierConfig?.ifsc || 'IDIB000T021'),
    TOTAL_TAXABLE_VALUE: formatCurrency(totalExclGst),
    CGST_TOTAL: formatCurrency(cgst),
    SGST_TOTAL: formatCurrency(sgst),
    IGST_TOTAL: formatCurrency(igst),
    SUB_TOTAL: formatCurrency(totalExclGst + cgst + sgst + igst),
    ROUND_OFF_AMT: formatCurrency(roundOffAmount),
    GRAND_TOTAL: formatCurrency(totalInclGst),
    AMOUNT_IN_WORDS: escapeHtml(toIndianWords(totalInclGst)),
    UPI_QR_BASE64_URL: qrDataUrl,
    QR_DISPLAY_TOGGLE: 'block',
    QR_PLACEHOLDER_TOGGLE: 'none',
  });
}

async function renderPdfBuffer(html) {
  process.env.PUPPETEER_CACHE_DIR =
    process.env.PUPPETEER_CACHE_DIR || path.join(process.cwd(), '.cache', 'puppeteer');
  const {default: puppeteer} = await import('puppeteer');
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  try {
    const page = await browser.newPage();
    await page.setContent(html, {waitUntil: 'domcontentloaded', timeout: 10000});
    const pdfBytes = await page.pdf({format: 'A4', printBackground: true});

    if (Buffer.isBuffer(pdfBytes)) {
      return pdfBytes;
    }

    if (pdfBytes instanceof Uint8Array) {
      return Buffer.from(pdfBytes.buffer, pdfBytes.byteOffset, pdfBytes.byteLength);
    }

    return Buffer.from(pdfBytes);
  } finally {
    await browser.close();
  }
}

module.exports = {buildInvoiceHtml, renderPdfBuffer};