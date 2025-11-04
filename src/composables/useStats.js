import { computed } from 'vue';
import { DAYS_OF_WEEK } from '../utils/constants';
import { categorizeProduct } from '../utils/categorization';

export function useStats(filteredPurchases) {
  const stats = computed(() => {
    if (filteredPurchases.value.length === 0) {
      return {
        totalSpent: 0,
        totalProducts: 0,
        totalPromos: 0,
        totalTransactions: 0,
        uniqueProducts: 0,
        uniqueStores: 0,
        avgBasket: 0,
        topStore: '-',
        topProduct: '-',
        topProductCount: 0,
        favoriteDay: '-',
        favoriteHour: '-'
      };
    }

    const totalSpent = filteredPurchases.value.reduce((sum, p) => sum + p.price, 0);
    const totalProducts = filteredPurchases.value.reduce((sum, p) => sum + p.quantity, 0);
    const totalPromos = filteredPurchases.value.reduce((sum, p) => sum + p.promo, 0);

    const transactions = new Set(filteredPurchases.value.map(p =>
      `${p.date}_${p.store}_${p.transactionNumber}`
    )).size;

    // Count unique transactions per store
    const storeTransactions = {};
    filteredPurchases.value.forEach(p => {
      if (!storeTransactions[p.store]) {
        storeTransactions[p.store] = new Set();
      }
      const transactionKey = `${p.date}_${p.transactionNumber}`;
      storeTransactions[p.store].add(transactionKey);
    });
    const storeCount = {};
    Object.keys(storeTransactions).forEach(store => {
      storeCount[store] = storeTransactions[store].size;
    });
    const topStore = Object.keys(storeCount).length > 0
      ? Object.keys(storeCount).reduce((a, b) => storeCount[a] > storeCount[b] ? a : b)
      : '-';

    const productCount = {};
    filteredPurchases.value.forEach(p => {
      productCount[p.product] = (productCount[p.product] || 0) + 1;
    });
    const topProduct = Object.keys(productCount).length > 0
      ? Object.keys(productCount).reduce((a, b) => productCount[a] > productCount[b] ? a : b)
      : '-';

    const dayCount = {};
    filteredPurchases.value.forEach(p => {
      const day = new Date(p.date).getDay();
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const favDay = Object.keys(dayCount).length > 0
      ? Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b)
      : 0;

    const hourCount = {};
    filteredPurchases.value.forEach(p => {
      if (p.time) {
        const hour = parseInt(p.time.split(':')[0]);
        hourCount[hour] = (hourCount[hour] || 0) + 1;
      }
    });
    const favHour = Object.keys(hourCount).length > 0
      ? Object.keys(hourCount).reduce((a, b) => hourCount[a] > hourCount[b] ? a : b)
      : '-';

    return {
      totalSpent,
      totalProducts,
      totalPromos,
      totalTransactions: transactions,
      uniqueProducts: Object.keys(productCount).length,
      uniqueStores: Object.keys(storeCount).length,
      avgBasket: totalSpent / transactions,
      topStore,
      topProduct,
      topProductCount: productCount[topProduct] || 0,
      favoriteDay: DAYS_OF_WEEK[favDay],
      favoriteHour: favHour
    };
  });

  const topProducts = computed(() => {
    if (filteredPurchases.value.length === 0) return [];

    const productData = {};
    filteredPurchases.value.forEach(p => {
      if (!productData[p.product]) {
        productData[p.product] = { count: 0, total: 0 };
      }
      productData[p.product].count++;
      productData[p.product].total += p.price;
    });

    return Object.entries(productData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  });

  const topExpensiveProducts = computed(() => {
    if (filteredPurchases.value.length === 0) return [];

    const productData = {};
    filteredPurchases.value.forEach(p => {
      if (!productData[p.product]) {
        productData[p.product] = { count: 0, total: 0 };
      }
      productData[p.product].count++;
      productData[p.product].total += p.price;
    });

    return Object.entries(productData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  });

  const storeStats = computed(() => {
    if (filteredPurchases.value.length === 0) return [];

    const storeData = {};
    filteredPurchases.value.forEach(p => {
      if (!storeData[p.store]) {
        storeData[p.store] = {
          visits: new Set(),
          total: 0
        };
      }
      // Track unique transactions per store
      const transactionKey = `${p.date}_${p.transactionNumber}`;
      storeData[p.store].visits.add(transactionKey);
      storeData[p.store].total += p.price;
    });

    return Object.entries(storeData)
      .map(([name, data]) => ({
        name,
        visits: data.visits.size, // Convert Set to count
        total: data.total
      }))
      .sort((a, b) => b.total - a.total);
  });

  return {
    stats,
    topProducts,
    topExpensiveProducts,
    storeStats
  };
}
