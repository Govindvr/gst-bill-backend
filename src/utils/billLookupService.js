const {supabase} = require('./subabaseClient');
const {normalizeInvoiceNumber} = require('./ocb-invoice');

async function findBillIdByYearAndNumber(year, billNumber) {
  const fyStart = Number.parseInt(String(year), 10);
  const billKindGuess = /B2B/i.test(String(billNumber)) ? 'B2B' : 'B2C';
  const normalizedInvoiceNumber = normalizeInvoiceNumber(billNumber, billKindGuess);

  const {data, error} = await supabase
    .from('bill')
    .select('id')
    .eq('financial_year_start', fyStart)
    .eq('invoice_number', normalizedInvoiceNumber)
    .limit(1);

  if (error) {
    throw new Error(`Bill lookup failed: ${error.message}`);
  }
  if (!data || data.length === 0) {
    return null;
  }
  return data[0].id;
}

async function getBillWithItems(billId) {
  const {data, error} = await supabase
    .from('bill')
    .select(
      `*, billitems:billitems (
        id, product_id, product_name, hsn_sac, gst_rate,
        quantity, unit, unitprice, disc, pregstprice, item_total
      )`,
    )
    .eq('id', billId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch bill: ${error.message}`);
  }
  return data;
}

async function getSupplierConfig() {
  const {data, error} = await supabase
    .from('supplier_config')
    .select('*')
    .order('updated_at', {ascending: false})
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch supplier config: ${error.message}`);
  }
  return data && data.length > 0 ? data[0] : null;
}

module.exports = {findBillIdByYearAndNumber, getBillWithItems, getSupplierConfig};