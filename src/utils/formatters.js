/**
 * Format a number as Swiss Franc currency
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF'
  }).format(value);
}

/**
 * Format a date string to Swiss format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format time label based on aggregation type
 * @param {string} key - The time key
 * @param {string} aggregation - The aggregation type (day, week, month, year)
 * @returns {string} Formatted label
 */
export function formatTimeLabel(key, aggregation) {
  switch (aggregation) {
    case 'day':
      return new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'week':
      const weekMatch = key.match(/(\d{4})-W(\d{2})/);
      if (weekMatch) {
        const [, year, week] = weekMatch;
        return `W${parseInt(week)} ${year}`;
      }
      return key;
    case 'month':
      const [year, month] = key.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    case 'year':
      return key;
    default:
      return key;
  }
}
