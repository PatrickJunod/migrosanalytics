<template>
  <div class="filter-section fade-in">
    <div class="filter-header">
      <h3>Filters</h3>
      <button
        class="btn-reset"
        @click="resetFilters"
        :disabled="!hasActiveFilters"
      >
        Reset filters
      </button>
    </div>

    <div class="filter-grid">
      <!-- Date Range Filter -->
      <div class="filter-group">
        <label class="filter-label">Date range</label>
        <div class="date-range">
          <input
            type="date"
            v-model="localFilters.dateFrom"
            :max="localFilters.dateTo || maxDate"
            class="date-input"
            @change="emitFilters"
          >
          <span class="date-separator">to</span>
          <input
            type="date"
            v-model="localFilters.dateTo"
            :min="localFilters.dateFrom || minDate"
            :max="maxDate"
            class="date-input"
            @change="emitFilters"
          >
        </div>
      </div>

      <!-- Categories Filter -->
      <div class="filter-group">
        <label class="filter-label">Categories ({{ selectedCategoriesCount }})</label>
        <div class="multi-select-wrapper">
          <button
            class="multi-select-trigger"
            @click="toggleCategoryDropdown"
            :class="{ active: showCategoryDropdown }"
          >
            <span v-if="selectedCategoriesCount === 0">All categories</span>
            <span v-else-if="selectedCategoriesCount === categories.length">All categories</span>
            <span v-else>{{ selectedCategoriesCount }} selected</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div v-if="showCategoryDropdown" class="multi-select-dropdown">
            <div class="dropdown-options">
              <label
                v-for="category in categories"
                :key="category"
                class="checkbox-label"
                :class="{ disabled: isFilterCooldown }"
              >
                <input
                  type="checkbox"
                  :value="category"
                  v-model="localFilters.categories"
                  @change="emitFilters"
                  :disabled="isFilterCooldown"
                >
                <span>{{ category }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Shops Filter -->
      <div class="filter-group">
        <label class="filter-label">Shops ({{ selectedShopsCount }})</label>
        <div class="multi-select-wrapper">
          <button
            class="multi-select-trigger"
            @click="toggleShopDropdown"
            :class="{ active: showShopDropdown }"
          >
            <span v-if="selectedShopsCount === 0">All shops</span>
            <span v-else-if="selectedShopsCount === shops.length">All shops</span>
            <span v-else>{{ selectedShopsCount }} selected</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div v-if="showShopDropdown" class="multi-select-dropdown">
            <div class="dropdown-options">
              <label
                v-for="shop in shops"
                :key="shop"
                class="checkbox-label"
                :class="{ disabled: isFilterCooldown }"
              >
                <input
                  type="checkbox"
                  :value="shop"
                  v-model="localFilters.shops"
                  @change="emitFilters"
                  :disabled="isFilterCooldown"
                >
                <span>{{ shop }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

export default {
  name: 'FilterSection',
  props: {
    categories: {
      type: Array,
      required: true
    },
    shops: {
      type: Array,
      required: true
    },
    minDate: {
      type: String,
      default: ''
    },
    maxDate: {
      type: String,
      default: ''
    }
  },
  emits: ['update:filters'],
  setup(props, { emit }) {
    const showCategoryDropdown = ref(false);
    const showShopDropdown = ref(false);
    const isFilterCooldown = ref(false);
    let cooldownTimeout = null;

    const localFilters = ref({
      dateFrom: '',
      dateTo: '',
      categories: [],
      shops: []
    });

    const selectedCategoriesCount = computed(() => localFilters.value.categories.length);
    const selectedShopsCount = computed(() => localFilters.value.shops.length);

    const hasActiveFilters = computed(() => {
      return localFilters.value.dateFrom !== '' ||
             localFilters.value.dateTo !== '' ||
             localFilters.value.categories.length > 0 ||
             localFilters.value.shops.length > 0;
    });

    function emitFilters() {
      // Set cooldown to prevent rapid filter changes
      isFilterCooldown.value = true;

      emit('update:filters', { ...localFilters.value });

      // Clear any existing cooldown timeout
      if (cooldownTimeout) {
        clearTimeout(cooldownTimeout);
      }

      // Enable filters after 1 second
      cooldownTimeout = setTimeout(() => {
        isFilterCooldown.value = false;
      }, 1000);
    }

    function resetFilters() {
      localFilters.value = {
        dateFrom: '',
        dateTo: '',
        categories: [],
        shops: []
      };
      emitFilters();
    }

    function toggleCategoryDropdown() {
      showCategoryDropdown.value = !showCategoryDropdown.value;
      showShopDropdown.value = false;
    }

    function toggleShopDropdown() {
      showShopDropdown.value = !showShopDropdown.value;
      showCategoryDropdown.value = false;
    }

    function handleClickOutside(event) {
      const target = event.target;
      if (!target.closest('.multi-select-wrapper')) {
        showCategoryDropdown.value = false;
        showShopDropdown.value = false;
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
      if (cooldownTimeout) {
        clearTimeout(cooldownTimeout);
      }
    });

    return {
      localFilters,
      showCategoryDropdown,
      showShopDropdown,
      isFilterCooldown,
      selectedCategoriesCount,
      selectedShopsCount,
      hasActiveFilters,
      emitFilters,
      resetFilters,
      toggleCategoryDropdown,
      toggleShopDropdown
    };
  }
};
</script>

<style scoped>
.filter-section {
  margin: 0 3rem 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #222 100%);
  border-radius: 12px;
  border: 1px solid #333;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.filter-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
}

.btn-reset {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: #333;
  color: #fff;
  border: 1px solid #444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover:not(:disabled) {
  background: #444;
  border-color: #555;
}

.btn-reset:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #a0a0a0;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  flex: 1;
  padding: 0.625rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.date-input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.date-separator {
  color: #666;
  font-size: 0.875rem;
}

.multi-select-wrapper {
  position: relative;
}

.multi-select-trigger {
  width: 100%;
  padding: 0.625rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  text-align: left;
}

.multi-select-trigger:hover,
.multi-select-trigger.active {
  border-color: #ff6b35;
}

.dropdown-arrow {
  font-size: 0.7rem;
  color: #666;
  transition: transform 0.2s ease;
}

.multi-select-trigger.active .dropdown-arrow {
  transform: rotate(180deg);
}

.multi-select-dropdown {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dropdown-options {
  padding: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.checkbox-label:hover {
  background: #222;
}

.checkbox-label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #ff6b35;
}

.checkbox-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
}

.checkbox-label span {
  font-size: 0.875rem;
  color: #fff;
}

/* Scrollbar styling */
.multi-select-dropdown::-webkit-scrollbar {
  width: 8px;
}

.multi-select-dropdown::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 4px;
}

.multi-select-dropdown::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

.multi-select-dropdown::-webkit-scrollbar-thumb:hover {
  background: #444;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-section {
    margin: 0 1rem 1rem;
    padding: 1rem;
  }

  .filter-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .date-range {
    flex-direction: column;
    align-items: stretch;
  }

  .date-separator {
    text-align: center;
  }
}
</style>
