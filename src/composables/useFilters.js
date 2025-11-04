import { ref, computed } from 'vue';
import { categorizeProduct } from '../utils/categorization';

export function useFilters(purchases) {
  const filters = ref({
    dateFrom: '',
    dateTo: '',
    categories: [],
    shops: []
  });

  const availableCategories = computed(() => {
    if (purchases.value.length === 0) return [];
    const categories = new Set();
    purchases.value.forEach(p => {
      categories.add(categorizeProduct(p.product));
    });
    return Array.from(categories).sort();
  });

  const availableShops = computed(() => {
    if (purchases.value.length === 0) return [];
    const shops = new Set(purchases.value.map(p => p.store));
    return Array.from(shops).sort();
  });

  const dateRange = computed(() => {
    if (purchases.value.length === 0) return { min: '', max: '' };
    const dates = purchases.value.map(p => p.date).sort();
    return {
      min: dates[0],
      max: dates[dates.length - 1]
    };
  });

  const filteredPurchases = computed(() => {
    if (purchases.value.length === 0) return [];

    let filtered = purchases.value;

    // Filter by date range
    if (filters.value.dateFrom) {
      filtered = filtered.filter(p => p.date >= filters.value.dateFrom);
    }
    if (filters.value.dateTo) {
      filtered = filtered.filter(p => p.date <= filters.value.dateTo);
    }

    // Filter by categories
    if (filters.value.categories.length > 0) {
      filtered = filtered.filter(p => {
        const category = categorizeProduct(p.product);
        return filters.value.categories.includes(category);
      });
    }

    // Filter by shops
    if (filters.value.shops.length > 0) {
      filtered = filtered.filter(p => filters.value.shops.includes(p.store));
    }

    return filtered;
  });

  function updateFilters(newFilters) {
    filters.value = { ...newFilters };
  }

  return {
    filters,
    availableCategories,
    availableShops,
    dateRange,
    filteredPurchases,
    updateFilters
  };
}
