<template>
  <section id="stores-content" class="content-section">
    <h2 class="section-title">Magasins</h2>

    <ChartCard
      title="Répartition par magasin"
      height="300px"
      :is-loading="isLoading"
      :is-empty="isEmpty"
      empty-icon="🏪"
      empty-message="Aucune donnée à afficher"
      @canvas-ready="$emit('store-canvas-ready', $event)"
    />

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
</template>

<script>
import ChartCard from '../common/ChartCard.vue';
import { formatCurrency } from '../../utils/formatters';

export default {
  name: 'StoresTab',
  components: {
    ChartCard
  },
  props: {
    storeStats: {
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
    }
  },
  emits: ['store-canvas-ready'],
  setup() {
    return {
      formatCurrency
    };
  }
};
</script>
