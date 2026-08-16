const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

const convertTwoDigits = (num: number): string => {
  if (num < 20) return ones[num];
  return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
};

const convertThreeDigits = (num: number): string => {
  if (num === 0) return '';
  if (num < 100) return convertTwoDigits(num);
  return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertTwoDigits(num % 100) : '');
};

/**
 * Converts a number to words in the Indian numbering system.
 * Supports up to 99,99,99,999 (99 crore).
 */
export const numberToWords = (amount: number): string => {
  if (amount === 0) return 'Zero Rupees Only';

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = '';

  if (rupees === 0) {
    result = '';
  } else {
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const hundred = rupees % 1000;

    const parts: string[] = [];

    if (crore > 0) parts.push(convertTwoDigits(crore) + ' Crore');
    if (lakh > 0) parts.push(convertTwoDigits(lakh) + ' Lakh');
    if (thousand > 0) parts.push(convertTwoDigits(thousand) + ' Thousand');
    if (hundred > 0) parts.push(convertThreeDigits(hundred));

    result = parts.join(' ') + ' Rupees';
  }

  if (paise > 0) {
    if (result) result += ' and ';
    result += convertTwoDigits(paise) + ' Paise';
  }

  return result + ' Only';
};
