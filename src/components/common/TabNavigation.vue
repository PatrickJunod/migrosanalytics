<template>
  <div class="tabs fade-in">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab"
      :class="{ active: activeTab === tab.id }"
      @click="$emit('switch-tab', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'TabNavigation',
  props: {
    tabs: {
      type: Array,
      required: true
    },
    activeTab: {
      type: String,
      required: true
    }
  },
  emits: ['switch-tab']
};
</script>
