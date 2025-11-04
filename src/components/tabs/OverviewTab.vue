<template>
  <section id="overview-content" class="content-section">
    <h2 class="section-title">Overview</h2>

    <!-- Stats Cards -->
    <div class="dashboard">
      <StatsCard
        v-for="(stat, index) in overviewStats.slice(0, 6)"
        :key="index"
        :icon="stat.icon"
        :title="stat.title"
        :value="stat.value"
        :label="stat.label"
        :is-loading="isLoading"
      />
    </div>

    <!-- Charts Row -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0 3rem 1.5rem;">
      <ChartCard
        title="Monthly expenses"
        height="250px"
        :is-loading="isLoading"
        :is-empty="isEmpty"
        empty-icon="📈"
        :container-style="{ margin: 0 }"
        @canvas-ready="$emit('monthly-canvas-ready', $event)"
      />
      <ChartCard
        title="Distribution by categories"
        height="250px"
        :is-loading="isLoading"
        :is-empty="isEmpty"
        empty-icon="🥧"
        :container-style="{ margin: 0 }"
        @canvas-ready="$emit('category-canvas-ready', $event)"
      />
    </div>
  </section>
</template>

<script>
import { computed } from 'vue';
import StatsCard from '../common/StatsCard.vue';
import ChartCard from '../common/ChartCard.vue';
import { formatCurrency } from '../../utils/formatters';

export default {
  name: 'OverviewTab',
  components: {
    StatsCard,
    ChartCard
  },
  props: {
    stats: {
      type: Object,
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
  emits: ['monthly-canvas-ready', 'category-canvas-ready'],
  setup(props) {
    const overviewStats = computed(() => [
      {
        icon: '💰',
        title: 'Total spent',
        value: formatCurrency(props.stats.totalSpent),
        label: `Over ${props.stats.totalTransactions} transactions`
      },
      {
        icon: '🛍️',
        title: 'Products purchased',
        value: Math.round(props.stats.totalProducts),
        label: `${props.stats.uniqueProducts} unique products`
      },
      {
        icon: '📈',
        title: 'Average basket',
        value: formatCurrency(props.stats.avgBasket),
        label: 'Per transaction'
      },
      {
        icon: '🏪',
        title: 'Stores visited',
        value: props.stats.uniqueStores,
        label: `Favorite: ${props.stats.topStore}`
      },
      {
        icon: '🎯',
        title: 'Favorite product',
        value: props.stats.topProduct,
        label: `Purchased ${props.stats.topProductCount} times`
      },
      {
        icon: '💸',
        title: 'Savings',
        value: formatCurrency(props.stats.totalPromos),
        label: 'Thanks to promotions'
      }
    ]);

    return {
      overviewStats
    };
  }
};
</script>
