<template>
  <div class="chart-container fade-in" :style="containerStyle">
    <div v-if="showHeader" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="margin: 0;">{{ title }}</h3>
      <slot name="header-actions"></slot>
    </div>
    <h3 v-else>{{ title }}</h3>
    <div class="chart-wrapper" :style="{ height: height }">
      <div v-if="isLoading" class="skeleton skeleton-chart"></div>
      <div v-else-if="isEmpty" class="empty-chart">
        <div class="empty-icon">{{ emptyIcon }}</div>
        <p>{{ emptyMessage }}</p>
      </div>
      <canvas v-else ref="canvas"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue';

export default {
  name: 'ChartCard',
  props: {
    title: {
      type: String,
      required: true
    },
    height: {
      type: String,
      default: '300px'
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    emptyIcon: {
      type: String,
      default: '📊'
    },
    emptyMessage: {
      type: String,
      default: 'No data to display'
    },
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    showHeader: {
      type: Boolean,
      default: false
    }
  },
  emits: ['canvas-ready'],
  setup(props, { emit }) {
    const canvas = ref(null);

    onMounted(() => {
      if (canvas.value) {
        emit('canvas-ready', canvas.value);
      }
    });

    watch(() => props.isEmpty, (newVal, oldVal) => {
      if (!newVal && oldVal) {
        // isEmpty changed from true to false, wait for canvas to be in DOM
        nextTick(() => {
          if (canvas.value) {
            emit('canvas-ready', canvas.value);
          }
        });
      }
    });

    watch(() => props.isLoading, (newVal, oldVal) => {
      if (!newVal && oldVal && !props.isEmpty) {
        // Loading finished and not empty, emit canvas-ready
        nextTick(() => {
          if (canvas.value) {
            emit('canvas-ready', canvas.value);
          }
        });
      }
    });

    return {
      canvas
    };
  }
};
</script>
