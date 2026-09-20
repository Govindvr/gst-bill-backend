function formatCurrency(value) {
  const safeValue = Number(value ?? 0);
  return `₹${safeValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

const STATE_NAMES = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

function getStateName(stateCode) {
  return STATE_NAMES[stateCode] || stateCode || '';
}

function toIndianWords(amount) {
  const number = Math.round(Number(amount || 0));
  if (number === 0) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const under100 = v => (v < 10 ? ones[v] : v < 20 ? teens[v - 10] : (v % 10 ? `${tens[Math.floor(v / 10)]} ${ones[v % 10]}` : tens[Math.floor(v / 10)]));
  const under1000 = v => (v < 100 ? under100(v) : (v % 100 ? `${ones[Math.floor(v / 100)]} Hundred ${under100(v % 100)}` : `${ones[Math.floor(v / 100)]} Hundred`));

  const crore = Math.floor(number / 10000000);
  let rem = number % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundred = Math.floor(rem / 100);
  rem %= 100;

  const parts = [];
  if (crore) parts.push(`${under1000(crore)} Crore`);
  if (lakh) parts.push(`${under1000(lakh)} Lakh`);
  if (thousand) parts.push(`${under1000(thousand)} Thousand`);
  if (hundred) parts.push(`${under1000(hundred)} Hundred`);
  if (rem) parts.push(under100(rem));

  return `${parts.filter(Boolean).join(' ') || 'Zero'} Rupees Only`;
}

module.exports = {formatCurrency, getStateName, toIndianWords};