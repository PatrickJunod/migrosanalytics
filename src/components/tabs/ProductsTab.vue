<template>
  <section id="products-content" class="content-section">
    <h2 class="section-title">Products</h2>

    <div class="dashboard">
      <!-- Top Purchased Products -->
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

      <!-- Top Expensive Products -->
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

    <!-- Search and Table - Simplified for now -->
    <div v-if="!isEmpty" class="search-bar fade-in">
      <input
        type="text"
        :value="searchQuery"
        @input="$emit('search-change', $event.target.value)"
        class="search-input"
        placeholder="Rechercher un produit..."
      >
      <select :value="sortBy" @change="$emit('sort-change', $event.target.value)" class="filter-select">
        <option value="date">Trier par date</option>
        <option value="price">Trier par prix</option>
        <option value="quantity">Trier par quantité</option>
        <option value="name">Trier par nom</option>
      </select>
    </div>

    <slot name="product-table"></slot>
  </section>
</template>

<script>
import { formatCurrency } from '../../utils/formatters';

export default {
  name: 'ProductsTab',
  props: {
    topProducts: {
      type: Array,
      required: true
    },
    topExpensiveProducts: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    searchQuery: {
      type: String,
      default: ''
    },
    sortBy: {
      type: String,
      default: 'date'
    }
  },
  emits: ['search-change', 'sort-change'],
  setup() {
    return {
      formatCurrency
    };
  }
};
</script>
