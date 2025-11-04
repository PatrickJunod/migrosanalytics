<template>
  <section id="trends-content" class="content-section">
    <h2 class="section-title">Trends</h2>

    <!-- Trend Stats -->
    <div class="dashboard" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
      <StatsCard
        v-for="(trend, index) in trendStats"
        :key="index"
        :icon="trend.icon"
        :title="trend.title"
        :value="trend.value"
        :label="trend.label"
        :is-loading="isLoading"
      />
    </div>

    <!-- Charts Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0 3rem 1.5rem;">
      <ChartCard
        title="Expense evolution"
        height="200px"
        :is-loading="isLoading"
        :is-empty="isEmpty"
        empty-icon="📊"
        :container-style="{ margin: 0 }"
        :show-header="true"
        @canvas-ready="$emit('timeline-canvas-ready', $event)"
      >
        <template #header-actions>
          <select v-model="localTimeAggregation" class="filter-select" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" @change="$emit('time-aggregation-change', localTimeAggregation)">
            <option value="day">By day</option>
            <option value="week">By week</option>
            <option value="month">By month</option>
            <option value="year">By year</option>
          </select>
        </template>
      </ChartCard>
      <ChartCard
        title="Expenses by day of the week"
        height="200px"
        :is-loading="isLoading"
        :is-empty="isEmpty"
        empty-icon="📅"
        :container-style="{ margin: 0 }"
        @canvas-ready="$emit('day-of-week-canvas-ready', $event)"
      />
    </div>

    <ChartCard
      title="Expenses by hour"
      height="200px"
      :is-loading="isLoading"
      :is-empty="isEmpty"
      empty-icon="⏰"
      @canvas-ready="$emit('hour-canvas-ready', $event)"
    />
  </section>
</template>

<script>
import { ref, computed, watch } from 'vue';
import StatsCard from '../common/StatsCard.vue';
import ChartCard from '../common/ChartCard.vue';

export default {
  name: 'TrendsTab',
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
    },
    timeAggregation: {
      type: String,
      default: 'day'
    }
  },
  emits: ['time-aggregation-change', 'timeline-canvas-ready', 'day-of-week-canvas-ready', 'hour-canvas-ready'],
  setup(props) {
    const localTimeAggregation = ref(props.timeAggregation);

    watch(() => props.timeAggregation, (newVal) => {
      localTimeAggregation.value = newVal;
    });

    const trendStats = computed(() => [
      {
        icon: '📅',
        title: 'Favorite day',
        value: props.stats.favoriteDay,
        label: 'Most frequent day'
      },
      {
        icon: '⏰',
        title: 'Favorite hour',
        value: `${props.stats.favoriteHour}h`,
        label: 'Most frequent hour'
      }
    ]);

    return {
      localTimeAggregation,
      trendStats
    };
  }
};
</script>
