<template>
  <div class="card stagger-item">
    <div class="card-header">
      <div class="card-icon">{{ icon }}</div>
      <h3 class="card-title">{{ title }}</h3>
    </div>
    <div v-if="isLoading" class="skeleton skeleton-value"></div>
    <div v-else class="stat-value">{{ value }}</div>
    <div v-if="!isLoading && label" class="stat-label">{{ label }}</div>
  </div>
</template>

<script>
export default {
  name: 'StatsCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  }
};
</script>
