/**
 * OptiBuy Centralized Currency Formatter
 * Formats product prices into Indian Rupees (INR - ₹) using en-IN locale
 */

/**
 * Format any price (USD numeric, string, or direct INR numeric) into formatted INR (₹XX,XXX)
 * @param {number|string} price - Price value to format
 * @returns {string} Formatted INR currency string (e.g. ₹1,09,999)
 */
export const formatCurrencyINR = (price) => {
  if (price === null || price === undefined || price === '') return '₹0';

  // Extract clean numerical value from string if needed
  let num = typeof price === 'string' 
    ? parseFloat(price.replace(/[^0-9.-]+/g, '')) 
    : Number(price);

  if (isNaN(num) || num < 0) return '₹0';

  // If price is stored in USD range (<= 5000), convert to approx market INR value (~88 INR/USD)
  // Rounded nicely to standard Indian retail pricing ending in 99 or 00
  if (num > 0 && num <= 5000) {
    const converted = num * 88;
    num = Math.round(converted / 100) * 100 - 1; // e.g. 1199 * 88 = 105512 -> ₹1,05,499
    if (num < 0) num = 0;
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  } catch (e) {
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  }
};

export default formatCurrencyINR;
