<template>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon migros-m">M</div>
          <div class="logo-text">
            <h1>Migros Analytics</h1>
            <p>Analyze your shopping data</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Upload Zone -->
    <div v-if="!hasData" class="upload-container">
      <div
        class="upload-zone"
        @click="triggerFileInput"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        :class="{ dragover: isDragging }"
      >
        <div class="upload-icon">📁</div>
        <h2>Drag and drop your CSV files</h2>
        <p>Import your Migros exports to start the analysis</p>
        <button class="btn-primary">Select files</button>
        <input
          type="file"
          ref="fileInput"
          class="file-input"
          multiple
          accept=".csv"
          @change="handleFileSelect"
        >
      </div>
    </div>

    <!-- Main Content -->
    <div
      v-if="hasData"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="{ 'drag-overlay': isDragging }"
    >
      <!-- Drag overlay -->
      <div v-if="isDragging" class="drag-overlay-content">
        <div class="drag-icon">📎</div>
        <h3>Add CSV files</h3>
        <p>Release to import</p>
      </div>

      <!-- Loaded Files -->
      <div class="loaded-files fade-in">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3>Loaded files</h3>
          <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;" @click="triggerAdditionalFileInput">
            + Add files
          </button>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <div v-for="file in loadedFiles" :key="file" class="file-tag" style="display: flex; align-items: center; gap: 0.5rem;">
            {{ file }}
            <button @click="removeFile(file)" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; font-size: 1.2rem;" title="Remove this file">
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs fade-in">
        <button
          class="tab"
          :class="{ active: activeTab === 'overview' }"
          @click="switchTab('overview')"
        >
          Overview
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'trends' }"
          @click="switchTab('trends')"
        >
          Trends
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'products' }"
          @click="switchTab('products')"
        >
          Products
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'stores' }"
          @click="switchTab('stores')"
        >
          Stores
        </button>
      </div>

      <!-- Content Container -->
      <div id="content-container">
        <!-- Overview Section -->
        <section id="overview-content" class="content-section">
          <h2 class="section-title">Overview</h2>

          <!-- Stats Cards -->
          <div class="dashboard">
            <div class="card stagger-item" v-for="(stat, index) in overviewStats.slice(0, 6)" :key="index">
              <div class="card-header">
                <div class="card-icon">{{ stat.icon }}</div>
                <h3 class="card-title">{{ stat.title }}</h3>
              </div>
              <div v-if="isLoading" class="skeleton skeleton-value"></div>
              <div v-else class="stat-value">{{ stat.value }}</div>
              <div v-if="!isLoading" class="stat-label">{{ stat.label }}</div>
            </div>
          </div>

          <!-- Charts Row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0 3rem 1.5rem;">
            <div class="chart-container fade-in" style="margin: 0;">
              <h3>Monthly expenses</h3>
              <div class="chart-wrapper" style="height: 250px;">
                <div v-if="isLoading" class="skeleton skeleton-chart"></div>
                <div v-else-if="purchases.length === 0" class="empty-chart">
                  <div class="empty-icon">📈</div>
                  <p>No data to display</p>
                </div>
                <canvas v-else ref="monthlyChart"></canvas>
              </div>
            </div>
            <div class="chart-container fade-in" style="margin: 0;">
              <h3>Distribution by categories</h3>
              <div class="chart-wrapper" style="height: 250px;">
                <div v-if="isLoading" class="skeleton skeleton-chart"></div>
                <div v-else-if="purchases.length === 0" class="empty-chart">
                  <div class="empty-icon">🥧</div>
                  <p>No data to display</p>
                </div>
                <canvas v-else ref="categoryChart"></canvas>
              </div>
            </div>
          </div>
        </section>

        <!-- Trends Section -->
        <section id="trends-content" class="content-section">
          <h2 class="section-title">Trends</h2>

          <!-- Trend Stats -->
          <div class="dashboard" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            <div class="card stagger-item" v-for="(trend, index) in trendStats" :key="index">
              <div class="card-header">
                <div class="card-icon">{{ trend.icon }}</div>
                <h3 class="card-title">{{ trend.title }}</h3>
              </div>
              <div v-if="isLoading" class="skeleton skeleton-value"></div>
              <div v-else class="stat-value" style="font-size: 1.5rem;">{{ trend.value }}</div>
              <div v-if="!isLoading" class="stat-label">{{ trend.label }}</div>
            </div>
          </div>

          <!-- Charts Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0 3rem 1.5rem;">
            <div class="chart-container fade-in" style="margin: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0;">Expense evolution</h3>
                <select v-model="timeAggregation" class="filter-select" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                  <option value="day">By day</option>
                  <option value="week">By week</option>
                  <option value="month">By month</option>
                  <option value="year">By year</option>
                </select>
              </div>
              <div class="chart-wrapper" style="height: 200px;">
                <div v-if="isLoading" class="skeleton skeleton-chart"></div>
                <div v-else-if="purchases.length === 0" class="empty-chart">
                  <div class="empty-icon">📊</div>
                  <p>No data to display</p>
                </div>
                <canvas v-else ref="timelineChart"></canvas>
              </div>
            </div>
            <div class="chart-container fade-in" style="margin: 0;">
              <h3>Expenses by day of the week</h3>
              <div class="chart-wrapper" style="height: 200px;">
                <div v-if="isLoading" class="skeleton skeleton-chart"></div>
                <div v-else-if="purchases.length === 0" class="empty-chart">
                  <div class="empty-icon">📅</div>
                  <p>No data to display</p>
                </div>
                <canvas v-else ref="dayOfWeekChart"></canvas>
              </div>
            </div>
          </div>

          <div class="chart-container fade-in">
            <h3>Expenses by hour</h3>
            <div class="chart-wrapper" style="height: 200px;">
              <div v-if="isLoading" class="skeleton skeleton-chart"></div>
              <div v-else-if="purchases.length === 0" class="empty-chart">
                <div class="empty-icon">⏰</div>
                <p>No data to display</p>
              </div>
              <canvas v-else ref="hourChart"></canvas>
            </div>
          </div>
        </section>

        <!-- Products Section -->
        <section id="products-content" class="content-section">
          <h2 class="section-title">Products</h2>

          <div class="dashboard">
            <div class="card" style="grid-column: 1 / -1;">
              <div class="card-header">
                <div class="card-icon">🏆</div>
                <h3 class="card-title">Top 10 most purchased products</h3>
              </div>
              <ul class="top-products">
                <li v-if="isLoading" v-for="i in 10" :key="i">
                  <div class="skeleton skeleton-text" style="width: 60%;"></div>
                  <div class="skeleton skeleton-text" style="width: 20%;"></div>
                </li>
                <li v-else-if="topProducts.length === 0" class="empty-list-item">
                  <span class="empty-icon">📦</span>
                  <span>No products found</span>
                </li>
                <li v-else v-for="(item, index) in topProducts" :key="index">
                  <span class="product-name">{{ index + 1 }}. {{ item.name }}</span>
                  <span class="product-stat">{{ item.count }}× - {{ formatCurrency(item.total) }}</span>
                </li>
              </ul>
            </div>

            <div class="card" style="grid-column: 1 / -1;">
              <div class="card-header">
                <div class="card-icon">💎</div>
                <h3 class="card-title">Top 10 most expensive products</h3>
              </div>
              <ul class="top-products">
                <li v-if="isLoading" v-for="i in 10" :key="i">
                  <div class="skeleton skeleton-text" style="width: 60%;"></div>
                  <div class="skeleton skeleton-text" style="width: 20%;"></div>
                </li>
                <li v-else-if="topExpensiveProducts.length === 0" class="empty-list-item">
                  <span class="empty-icon">💰</span>
                  <span>No products found</span>
                </li>
                <li v-else v-for="(item, index) in topExpensiveProducts" :key="index">
                  <span class="product-name">{{ index + 1 }}. {{ item.name }}</span>
                  <span class="product-stat">{{ formatCurrency(item.total) }} ({{ item.count }}×)</span>
                </li>
              </ul>
            </div>
          </div>

          <div v-if="purchases.length > 0" class="search-bar fade-in">
            <input
              type="text"
              v-model="searchQuery"
              class="search-input"
              placeholder="Rechercher un produit..."
            >
            <select v-model="sortBy" class="filter-select">
              <option value="date">Trier par date</option>
              <option value="price">Trier par prix</option>
              <option value="quantity">Trier par quantité</option>
              <option value="name">Trier par nom</option>
            </select>
          </div>

          <div class="products-table fade-in">
            <h3>Purchase list ({{ filteredPurchases.length }} results)</h3>
            <div v-if="purchases.length === 0" class="empty-table">
              <div class="empty-icon">🛍️</div>
              <p>No purchases to display</p>
            </div>
            <div v-else>
              <table>
                <thead>
                  <tr>
                    <th @click="toggleSort('date')" class="sortable-header" :class="{ active: sortBy === 'date' }">
                      Date
                      <span v-if="sortBy === 'date'" class="sort-arrow">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                    </th>
                    <th @click="toggleSort('name')" class="sortable-header" :class="{ active: sortBy === 'name' }">
                      Product
                      <span v-if="sortBy === 'name'" class="sort-arrow">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                    </th>
                    <th @click="toggleSort('quantity')" class="sortable-header" :class="{ active: sortBy === 'quantity' }">
                      Quantity
                      <span v-if="sortBy === 'quantity'" class="sort-arrow">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                    </th>
                    <th @click="toggleSort('price')" class="sortable-header" :class="{ active: sortBy === 'price' }">
                      Price
                      <span v-if="sortBy === 'price'" class="sort-arrow">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                    </th>
                    <th>Promotion</th>
                    <th>Store</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="isLoading" v-for="i in 10" :key="i">
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                  </tr>
                  <tr v-else v-for="(purchase, index) in paginatedPurchases" :key="index">
                    <td>{{ formatDate(purchase.date) }}</td>
                    <td><strong>{{ purchase.product }}</strong></td>
                    <td>{{ purchase.quantity }}</td>
                    <td><strong>{{ formatCurrency(purchase.price) }}</strong></td>
                    <td>
                      <span v-if="purchase.promo > 0" class="badge badge-promo">
                        -{{ formatCurrency(purchase.promo) }}
                      </span>
                      <span v-else class="badge badge-regular">-</span>
                    </td>
                    <td>{{ purchase.store }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!isLoading && totalPages > 1" class="pagination">
                <button @click="currentPage = 1" :disabled="currentPage === 1">⏮</button>
                <button @click="currentPage--" :disabled="currentPage === 1">◀</button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="typeof page === 'number' && (currentPage = page)"
                  :class="{ active: currentPage === page }"
                  :disabled="typeof page !== 'number'"
                >
                  {{ page }}
                </button>
                <button @click="currentPage++" :disabled="currentPage === totalPages">▶</button>
                <button @click="currentPage = totalPages" :disabled="currentPage === totalPages">⏭</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Stores Section -->
        <section id="stores-content" class="content-section">
          <h2 class="section-title">Magasins</h2>

          <div class="chart-container fade-in">
            <h3>Répartition par magasin</h3>
            <div class="chart-wrapper">
              <div v-if="isLoading" class="skeleton skeleton-chart"></div>
              <div v-else-if="purchases.length === 0" class="empty-chart">
                <div class="empty-icon">🏪</div>
                <p>Aucune donnée à afficher</p>
              </div>
              <canvas v-else ref="storeChart"></canvas>
            </div>
          </div>

          <div class="dashboard">
            <div class="card" style="grid-column: 1 / -1;">
              <div class="card-header">
                <div class="card-icon">📍</div>
                <h3 class="card-title">Statistiques par magasin</h3>
              </div>
              <ul class="top-products">
                <li v-if="isLoading" v-for="i in 5" :key="i">
                  <div class="skeleton skeleton-text" style="width: 60%;"></div>
                  <div class="skeleton skeleton-text" style="width: 20%;"></div>
                </li>
                <li v-else-if="storeStats.length === 0" class="empty-list-item">
                  <span class="empty-icon">🏬</span>
                  <span>Aucun magasin trouvé</span>
                </li>
                <li v-else v-for="(store, index) in storeStats" :key="index">
                  <span class="product-name">{{ store.name }}</span>
                  <span class="product-stat">
                    {{ store.visits }} visites - {{ formatCurrency(store.total) }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <!-- Hidden file input for additional uploads -->
      <input
        type="file"
        ref="additionalFileInput"
        style="display: none;"
        multiple
        accept=".csv"
        @change="handleAdditionalFiles"
      >
    </div>

    <!-- Empty State for no data -->
    <div v-if="!hasData && !isLoading" class="empty-dashboard">
      <div class="empty-icon">📊</div>
      <h3>Ready to analyze your data</h3>
      <p>Import your Migros CSV files to get started</p>
    </div>

    <!-- Privacy Notice -->
    <div class="privacy-notice">
      <div class="privacy-content">
        🔒 <strong>Privacy:</strong> All your data stays in your browser. Nothing is sent to any server.
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <p>Created by <a href="https://patrickjunod.dev" target="_blank" rel="noopener noreferrer" class="footer-link">Patrick Junod (PatrickJunod.dev)</a></p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import Papa from 'papaparse';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'App',
  setup() {
    const hasData = ref(false);
    const isLoading = ref(false);
    const isDragging = ref(false);
    const loadedFiles = ref([]);
    const purchases = ref([]);
    const activeTab = ref('overview');
    const searchQuery = ref('');
    const sortBy = ref('date');
    const sortDirection = ref('desc'); // 'asc' or 'desc'
    const currentPage = ref(1);
    const itemsPerPage = 50;
    const timeAggregation = ref('day'); // day, week, month, year
    const fileInput = ref(null);
    const additionalFileInput = ref(null);
    const charts = ref({});

    // Chart refs
    const monthlyChart = ref(null);
    const categoryChart = ref(null);
    const timelineChart = ref(null);
    const dayOfWeekChart = ref(null);
    const hourChart = ref(null);
    const storeChart = ref(null);

    // Empty states
    const emptyStats = {
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

    // Computed properties
    const stats = computed(() => {
      if (purchases.value.length === 0) return emptyStats;

      const totalSpent = purchases.value.reduce((sum, p) => sum + p.price, 0);
      const totalProducts = purchases.value.reduce((sum, p) => sum + p.quantity, 0);
      const totalPromos = purchases.value.reduce((sum, p) => sum + p.promo, 0);

      const transactions = new Set(purchases.value.map(p =>
        `${p.date}_${p.store}_${p.transactionNumber}`
      )).size;

      const stores = purchases.value.map(p => p.store);
      const storeCount = {};
      stores.forEach(s => storeCount[s] = (storeCount[s] || 0) + 1);
      const topStore = Object.keys(storeCount).reduce((a, b) =>
        storeCount[a] > storeCount[b] ? a : b
      );

      const productCount = {};
      purchases.value.forEach(p => {
        productCount[p.product] = (productCount[p.product] || 0) + 1;
      });
      const topProduct = Object.keys(productCount).reduce((a, b) =>
        productCount[a] > productCount[b] ? a : b
      );

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayCount = {};
      purchases.value.forEach(p => {
        const day = new Date(p.date).getDay();
        dayCount[day] = (dayCount[day] || 0) + 1;
      });
      const favDay = Object.keys(dayCount).reduce((a, b) =>
        dayCount[a] > dayCount[b] ? a : b
      );

      const hourCount = {};
      purchases.value.forEach(p => {
        const hour = parseInt(p.time.split(':')[0]);
        hourCount[hour] = (hourCount[hour] || 0) + 1;
      });
      const favHour = Object.keys(hourCount).reduce((a, b) =>
        hourCount[a] > hourCount[b] ? a : b
      );

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
        topProductCount: productCount[topProduct],
        favoriteDay: days[favDay],
        favoriteHour: favHour
      };
    });

    const overviewStats = computed(() => [
      {
        icon: '💰',
        title: 'Total spent',
        value: formatCurrency(stats.value.totalSpent),
        label: `Over ${stats.value.totalTransactions} transactions`
      },
      {
        icon: '🛍️',
        title: 'Products purchased',
        value: Math.round(stats.value.totalProducts),
        label: `${stats.value.uniqueProducts} unique products`
      },
      {
        icon: '📈',
        title: 'Average basket',
        value: formatCurrency(stats.value.avgBasket),
        label: 'Per transaction'
      },
      {
        icon: '🏪',
        title: 'Stores visited',
        value: stats.value.uniqueStores,
        label: `Favorite: ${stats.value.topStore}`
      },
      {
        icon: '🎯',
        title: 'Favorite product',
        value: stats.value.topProduct,
        label: `Purchased ${stats.value.topProductCount} times`
      },
      {
        icon: '💸',
        title: 'Savings',
        value: formatCurrency(stats.value.totalPromos),
        label: 'Thanks to promotions'
      }
    ]);

    const trendStats = computed(() => [
      {
        icon: '📅',
        title: 'Favorite day',
        value: stats.value.favoriteDay,
        label: 'Most frequent day'
      },
      {
        icon: '⏰',
        title: 'Favorite hour',
        value: `${stats.value.favoriteHour}h`,
        label: 'Most frequent hour'
      }
    ]);

    const topProducts = computed(() => {
      if (purchases.value.length === 0) return [];

      const productData = {};
      purchases.value.forEach(p => {
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
      if (purchases.value.length === 0) return [];

      const productData = {};
      purchases.value.forEach(p => {
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
      if (purchases.value.length === 0) return [];

      const storeData = {};
      purchases.value.forEach(p => {
        if (!storeData[p.store]) {
          storeData[p.store] = { visits: 0, total: 0 };
        }
        storeData[p.store].visits++;
        storeData[p.store].total += p.price;
      });

      return Object.entries(storeData)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.total - a.total);
    });

    const filteredPurchases = computed(() => {
      if (purchases.value.length === 0) return [];

      let filtered = purchases.value;

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(p =>
          p.product.toLowerCase().includes(query) ||
          p.store.toLowerCase().includes(query)
        );
      }

      const sorted = [...filtered];
      const direction = sortDirection.value === 'asc' ? 1 : -1;

      switch (sortBy.value) {
        case 'price':
          sorted.sort((a, b) => (a.price - b.price) * direction);
          break;
        case 'quantity':
          sorted.sort((a, b) => (a.quantity - b.quantity) * direction);
          break;
        case 'name':
          sorted.sort((a, b) => a.product.localeCompare(b.product) * direction);
          break;
        default: // date
          sorted.sort((a, b) => (new Date(a.date) - new Date(b.date)) * direction);
      }

      return sorted;
    });

    const paginatedPurchases = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredPurchases.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredPurchases.value.length / itemsPerPage);
    });

    const visiblePages = computed(() => {
      const pages = [];
      const total = totalPages.value;
      const current = currentPage.value;

      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        }
      }

      return pages;
    });

    // Methods
    function formatCurrency(value) {
      return new Intl.NumberFormat('fr-CH', {
        style: 'currency',
        currency: 'CHF'
      }).format(value);
    }

    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    function triggerFileInput() {
      fileInput.value.click();
    }

    function triggerAdditionalFileInput() {
      additionalFileInput.value.click();
    }

    function handleDragOver() {
      isDragging.value = true;
    }

    function handleDragLeave() {
      isDragging.value = false;
    }

    function handleDrop(e) {
      isDragging.value = false;
      const files = e.dataTransfer.files;
      processFiles(files);
    }

    function handleFileSelect(e) {
      const files = e.target.files;
      processFiles(files);
    }

    function handleAdditionalFiles(e) {
      const files = e.target.files;
      processFiles(files);
    }

    function removeFile(fileName) {
      const index = loadedFiles.value.indexOf(fileName);
      if (index > -1) {
        loadedFiles.value.splice(index, 1);
        if (loadedFiles.value.length === 0) {
          reloadData();
        }
      }
    }

    function reloadData() {
      purchases.value = [];
      hasData.value = false;
      // Clear all charts
      Object.values(charts.value).forEach(chart => {
        if (chart) chart.destroy();
      });
      charts.value = {};
    }

    async function processFiles(files) {
      hasData.value = true;
      isLoading.value = true;

      for (let file of files) {
        if (file.name.endsWith('.csv') && !loadedFiles.value.includes(file.name)) {
          await parseCSV(file);
          loadedFiles.value.push(file.name);
        }
      }

      // Simulate loading delay for better UX
      setTimeout(() => {
        isLoading.value = false;
        nextTick(() => {
          createCharts();
        });
      }, 1000);
    }

    function parseCSV(file) {
      return new Promise((resolve) => {
        Papa.parse(file, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach(row => {
              if (row.Datum && row.Artikel && row.Umsatz) {
                const dateParts = row.Datum.split('.');
                const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

                purchases.value.push({
                  date: date,
                  time: row.Zeit || '',
                  store: row.Filiale || '',
                  product: row.Artikel || '',
                  quantity: parseFloat(row.Menge.replace(',', '.')) || 0,
                  promo: parseFloat(row.Aktion.replace(',', '.')) || 0,
                  price: parseFloat(row.Umsatz.replace(',', '.')) || 0,
                  transactionNumber: row.Transaktionsnummer || ''
                });
              }
            });
            resolve();
          }
        });
      });
    }

    function createCharts() {
      createMonthlyChart();
      createCategoryChart();
      createTimelineChart();
      createDayOfWeekChart();
      createHourChart();
      createStoreChart();
    }

    function createMonthlyChart() {
      if (!monthlyChart.value) return;
      if (purchases.value.length === 0) return;

      const monthlyData = {};
      purchases.value.forEach(p => {
        const month = p.date.substring(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + p.price;
      });

      const sortedMonths = Object.keys(monthlyData).sort();
      const ctx = monthlyChart.value.getContext('2d');

      if (charts.value.monthly) charts.value.monthly.destroy();

      charts.value.monthly = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedMonths.map(m => {
            const [year, month] = m.split('-');
            return new Date(year, month - 1).toLocaleDateString('fr-CH', {
              month: 'short',
              year: 'numeric'
            });
          }),
          datasets: [{
            label: 'Expenses',
            data: sortedMonths.map(m => monthlyData[m]),
            backgroundColor: '#ff6b35',
            borderColor: '#ff6b35',
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#2a2a2a'
              },
              ticks: {
                color: '#a0a0a0',
                callback: value => formatCurrency(value)
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#a0a0a0'
              }
            }
          }
        }
      });
    }

    function createCategoryChart() {
      if (!categoryChart.value) return;
      if (purchases.value.length === 0) return;

      const categories = {};
      purchases.value.forEach(p => {
        const category = categorizeProduct(p.product);
        categories[category] = (categories[category] || 0) + p.price;
      });

      const topCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const ctx = categoryChart.value.getContext('2d');

      if (charts.value.category) charts.value.category.destroy();

      charts.value.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: topCategories.map(c => c[0]),
          datasets: [{
            data: topCategories.map(c => c[1]),
            backgroundColor: [
              '#ff6b35', '#ff8c61', '#ffad8d', '#ffc3a8',
              '#ffd9c3', '#ffe8db', '#fff5f0', '#ffeee6',
              '#ffe0d1', '#ffd4bc'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#a0a0a0',
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = formatCurrency(context.parsed);
                  return `${label}: ${value}`;
                }
              }
            }
          }
        }
      });
    }

    function createTimelineChart() {
      if (!timelineChart.value) return;
      if (purchases.value.length === 0) return;

      const aggregatedData = aggregateDataByTime(purchases.value, timeAggregation.value);
      const sortedKeys = Object.keys(aggregatedData).sort();
      const ctx = timelineChart.value.getContext('2d');

      if (charts.value.timeline) {
        charts.value.timeline.destroy();
      }

      const chartData = {
        labels: sortedKeys.map(key => formatTimeLabel(key, timeAggregation.value)),
        datasets: [{
          label: 'Expenses',
          data: sortedKeys.map(key => aggregatedData[key]),
          borderColor: '#ff6b35',
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: timeAggregation.value === 'day' ? 0 : 4,
          pointHoverRadius: 6
        }]
      };

      charts.value.timeline = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: timeAggregation.value !== 'day',
                color: '#2a2a2a'
              },
              ticks: {
                color: '#a0a0a0',
                maxTicksLimit: timeAggregation.value === 'day' ? 15 : 10
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#2a2a2a'
              },
              ticks: {
                color: '#a0a0a0',
                callback: value => formatCurrency(value)
              }
            }
          }
        }
      });
    }

    function aggregateDataByTime(data, aggregation) {
      const aggregated = {};

      data.forEach(p => {
        const date = new Date(p.date);
        let key;

        switch (aggregation) {
          case 'day':
            key = p.date;
            break;
          case 'week':
            // Get Monday of the week (ISO week)
            const weekStart = new Date(date);
            const dayOfWeek = weekStart.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekStart.setDate(weekStart.getDate() - daysToMonday);
            key = `${weekStart.getFullYear()}-W${String(getISOWeek(weekStart)).padStart(2, '0')}`;
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'year':
            key = String(date.getFullYear());
            break;
          default:
            key = p.date;
        }

        if (!aggregated[key]) {
          aggregated[key] = 0;
        }
        aggregated[key] += p.price;
      });

      return aggregated;
    }

    function formatTimeLabel(key, aggregation) {
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

    function getISOWeek(date) {
      const tempDate = new Date(date.getTime());
      tempDate.setHours(0, 0, 0, 0);
      // Thursday in current week decides the year.
      tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
      // January 4 is always in week 1.
      const week1 = new Date(tempDate.getFullYear(), 0, 4);
      // Adjust to Thursday in week 1 and count weeks from there.
      return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    function updateTimelineChart() {
      if (purchases.value.length > 0) {
        // Use nextTick to ensure DOM is ready
        nextTick(() => {
          createTimelineChart();
        });
      }
    }

    function createDayOfWeekChart() {
      if (!dayOfWeekChart.value) return;
      if (purchases.value.length === 0) return;

      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const dayData = [0, 0, 0, 0, 0, 0, 0];

      purchases.value.forEach(p => {
        const day = new Date(p.date).getDay();
        dayData[day] += p.price;
      });

      const ctx = dayOfWeekChart.value.getContext('2d');

      if (charts.value.dayOfWeek) charts.value.dayOfWeek.destroy();

      charts.value.dayOfWeek = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'Expenses',
            data: dayData,
            backgroundColor: '#ff6b35',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#2a2a2a'
              },
              ticks: {
                color: '#a0a0a0',
                callback: value => formatCurrency(value)
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#a0a0a0'
              }
            }
          }
        }
      });
    }

    function createHourChart() {
      if (!hourChart.value) return;
      if (purchases.value.length === 0) return;

      const hourData = new Array(24).fill(0);

      purchases.value.forEach(p => {
        if (p.time) {
          const hour = parseInt(p.time.split(':')[0]);
          hourData[hour] += p.price;
        }
      });

      const ctx = hourChart.value.getContext('2d');

      if (charts.value.hour) charts.value.hour.destroy();

      charts.value.hour = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({length: 24}, (_, i) => `${i}h`),
          datasets: [{
            label: 'Expenses',
            data: hourData,
            borderColor: '#ff6b35',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#2a2a2a'
              },
              ticks: {
                color: '#a0a0a0',
                callback: value => formatCurrency(value)
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#a0a0a0'
              }
            }
          }
        }
      });
    }

    function createStoreChart() {
      if (!storeChart.value) return;
      if (purchases.value.length === 0) return;

      const storeData = {};
      purchases.value.forEach(p => {
        storeData[p.store] = (storeData[p.store] || 0) + p.price;
      });

      const sortedStores = Object.entries(storeData)
        .sort((a, b) => b[1] - a[1]);

      const ctx = storeChart.value.getContext('2d');

      if (charts.value.store) charts.value.store.destroy();

      charts.value.store = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedStores.map(s => s[0]),
          datasets: [{
            label: 'Expenses',
            data: sortedStores.map(s => s[1]),
            backgroundColor: '#ff6b35',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                color: '#2a2a2a'
              },
              ticks: {
                color: '#a0a0a0',
                callback: value => formatCurrency(value)
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: {
                color: '#a0a0a0'
              }
            }
          }
        }
      });
    }

    function categorizeProduct(productName) {
      const name = productName.toLowerCase();

      if (name.includes('pain') || name.includes('toast') || name.includes('baguette')) return 'Pain';
      if (name.includes('fromage') || name.includes('cheese') || name.includes('gruyère')) return 'Fromage';
      if (name.includes('lait') || name.includes('crème') || name.includes('yogourt')) return 'Produits laitiers';
      if (name.includes('poulet') || name.includes('viande') || name.includes('jambon') || name.includes('saucisse')) return 'Viande';
      if (name.includes('poisson') || name.includes('truite') || name.includes('saumon')) return 'Poisson';
      if (name.includes('tomate') || name.includes('carotte') || name.includes('poireau') || name.includes('légume')) return 'Légumes';
      if (name.includes('banane') || name.includes('pomme') || name.includes('raisin') || name.includes('fruit')) return 'Fruits';
      if (name.includes('pâte') || name.includes('riz') || name.includes('pasta')) return 'Pâtes & riz';
      if (name.includes('chocolat') || name.includes('bonbon') || name.includes('dessert')) return 'Sucreries';
      if (name.includes('eau') || name.includes('drink') || name.includes('jus')) return 'Boissons';

      return 'Autres';
    }

    // Hash routing functions
    function switchTab(tab) {
      activeTab.value = tab;
      window.location.hash = `#${tab}`;

      // Smooth scroll to content
      nextTick(() => {
        const targetElement = document.getElementById(`${tab}-content`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    function handleHashChange() {
      const hash = window.location.hash.substring(1);
      if (['overview', 'trends', 'products', 'stores'].includes(hash)) {
        activeTab.value = hash;
      }
    }

    function toggleSort(column) {
      if (sortBy.value === column) {
        // Same column clicked, toggle direction
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        // New column clicked, set to descending by default
        sortBy.value = column;
        sortDirection.value = 'desc';
      }
      currentPage.value = 1;
    }

    // Watchers
    watch([searchQuery, sortBy, sortDirection], () => {
      currentPage.value = 1;
    });

    watch(timeAggregation, () => {
      updateTimelineChart();
    });

    // Lifecycle
    onMounted(() => {
      // Handle initial hash
      handleHashChange();

      // Listen for hash changes
      window.addEventListener('hashchange', handleHashChange);
    });

    return {
      hasData,
      isLoading,
      isDragging,
      loadedFiles,
      purchases,
      activeTab,
      searchQuery,
      sortBy,
      currentPage,
      fileInput,
      additionalFileInput,
      overviewStats,
      trendStats,
      topProducts,
      topExpensiveProducts,
      storeStats,
      filteredPurchases,
      paginatedPurchases,
      totalPages,
      visiblePages,
      monthlyChart,
      categoryChart,
      timelineChart,
      dayOfWeekChart,
      hourChart,
      storeChart,
      formatCurrency,
      formatDate,
      triggerFileInput,
      triggerAdditionalFileInput,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleFileSelect,
      handleAdditionalFiles,
      removeFile,
      switchTab,
      timeAggregation,
      updateTimelineChart,
      sortDirection,
      toggleSort
    };
  }
};
</script>