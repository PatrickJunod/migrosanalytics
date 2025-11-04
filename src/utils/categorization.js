import { CATEGORY_KEYWORDS } from './constants';

/**
 * Categorize a product based on its name
 * @param {string} productName - The product name
 * @returns {string} The category name
 */
export function categorizeProduct(productName) {
  const name = productName.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }

  return 'Autres';
}

/**
 * Get all unique categories from purchases
 * @param {Array} purchases - Array of purchase objects
 * @returns {Array<string>} Sorted array of unique categories
 */
export function getUniqueCategories(purchases) {
  const categories = new Set();
  purchases.forEach(p => {
    categories.add(categorizeProduct(p.product));
  });
  return Array.from(categories).sort();
}
