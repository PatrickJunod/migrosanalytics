# Migros Analytics - Architecture Documentation

## Overview
This application follows Vue.js best practices with a modular, maintainable architecture using the Composition API.

## Project Structure

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── StatsCard.vue    # Statistics display card
│   │   ├── ChartCard.vue    # Chart container with loading states
│   │   ├── FileUpload.vue   # File upload with drag & drop
│   │   ├── LoadedFiles.vue  # Display loaded files
│   │   └── TabNavigation.vue # Tab switcher component
│   ├── tabs/                # Tab-specific components
│   │   ├── OverviewTab.vue  # Overview statistics and charts
│   │   ├── TrendsTab.vue    # Trends analysis
│   │   ├── ProductsTab.vue  # Products analysis
│   │   └── StoresTab.vue    # Stores analysis
│   └── FilterSection.vue    # Filter controls component
├── composables/             # Vue composables (reusable logic)
│   ├── useTransactions.js   # Transaction data management
│   ├── useFilters.js        # Filter state and logic
│   ├── useStats.js          # Statistics calculations
│   └── useCharts.js         # Chart creation and management
├── utils/                   # Utility functions
│   ├── formatters.js        # Currency and date formatting
│   ├── constants.js         # App constants
│   └── categorization.js    # Product categorization logic
├── App.vue                  # Main application component
└── main.js                  # Application entry point
```

## Design Principles

### 1. **Separation of Concerns**
- **Composables**: Business logic and state management
- **Components**: UI presentation
- **Utils**: Pure functions for data transformation

### 2. **KISS (Keep It Simple, Stupid)**
- Each component has a single responsibility
- Clear and descriptive naming
- Minimal dependencies between modules

### 3. **Reusability**
- Generic components (`StatsCard`, `ChartCard`) can be used anywhere
- Composables can be shared across components
- Utility functions are pure and testable

### 4. **Maintainability**
- Small, focused files (< 300 lines)
- Clear file organization
- Consistent code style

## Composables

### useTransactions
**Purpose**: Manage purchase data and file operations

**API**:
```javascript
const {
  purchases,      // ref: Array of purchase objects
  loadedFiles,    // ref: Array of loaded file names
  isLoading,      // ref: Loading state
  processFiles,   // fn: Process CSV files
  removeFile,     // fn: Remove a loaded file
  clearAll        // fn: Clear all data
} = useTransactions();
```

### useFilters
**Purpose**: Manage filter state and filtered data

**API**:
```javascript
const {
  filters,              // ref: Current filter values
  availableCategories,  // computed: Available categories
  availableShops,       // computed: Available shops
  dateRange,            // computed: Min/max dates
  filteredPurchases,    // computed: Filtered purchase array
  updateFilters         // fn: Update filter values
} = useFilters(purchases);
```

### useStats
**Purpose**: Calculate statistics from filtered data

**API**:
```javascript
const {
  stats,                  // computed: General statistics
  topProducts,            // computed: Top 10 purchased products
  topExpensiveProducts,   // computed: Top 10 expensive products
  storeStats              // computed: Statistics per store
} = useStats(filteredPurchases);
```

### useCharts
**Purpose**: Create and manage Chart.js instances

**API**:
```javascript
const {
  charts,                // ref: Chart instances registry
  createMonthlyChart,    // fn: Create monthly expenses chart
  createCategoryChart,   // fn: Create category pie chart
  createTimelineChart,   // fn: Create timeline chart
  createDayOfWeekChart,  // fn: Create day of week chart
  createHourChart,       // fn: Create hourly chart
  createStoreChart,      // fn: Create store chart
  destroyAllCharts       // fn: Destroy all chart instances
} = useCharts(filteredPurchases);
```

## Components

### Common Components

#### StatsCard
Displays a single statistic with icon, title, value, and label.

**Props**:
- `icon`: String (emoji)
- `title`: String
- `value`: String | Number
- `label`: String (optional)
- `isLoading`: Boolean

#### ChartCard
Container for charts with loading and empty states.

**Props**:
- `title`: String
- `height`: String (default: '300px')
- `isLoading`: Boolean
- `isEmpty`: Boolean
- `emptyIcon`: String
- `emptyMessage`: String
- `containerStyle`: Object (optional)
- `showHeader`: Boolean (for actions)

**Events**:
- `canvas-ready`: Emitted when canvas is mounted with canvas element

**Slots**:
- `header-actions`: Additional controls in header

**How it works**:
The component emits a `canvas-ready` event when the canvas element is mounted, passing the canvas DOM element. This allows the parent to receive the canvas reference and create charts on it.

#### FileUpload
File upload zone with drag & drop support.

**Props**:
- `hasData`: Boolean

**Events**:
- `files-selected`: Emitted with FileList

#### LoadedFiles
Display loaded files with remove buttons.

**Props**:
- `files`: Array<String>

**Events**:
- `add-files`: User wants to add more files
- `remove-file`: User wants to remove a file

#### TabNavigation
Tab navigation bar.

**Props**:
- `tabs`: Array<{ id: String, label: String }>
- `activeTab`: String

**Events**:
- `switch-tab`: Emitted with tab id

### Tab Components

#### OverviewTab
Shows overview statistics and main charts.

**Events**:
- `monthly-canvas-ready`: Canvas ready for monthly chart
- `category-canvas-ready`: Canvas ready for category chart

#### TrendsTab
Shows trends analysis with time aggregation.

**Events**:
- `timeline-canvas-ready`: Canvas ready for timeline chart
- `day-of-week-canvas-ready`: Canvas ready for day of week chart
- `hour-canvas-ready`: Canvas ready for hour chart
- `time-aggregation-change`: Time aggregation changed

#### ProductsTab
Shows product statistics and search/table.

**Events**:
- `search-change`: Search query changed
- `sort-change`: Sort field changed

#### StoresTab
Shows store statistics and chart.

**Events**:
- `store-canvas-ready`: Canvas ready for store chart

## Utils

### formatters.js
- `formatCurrency(value)`: Format number as CHF currency
- `formatDate(dateString)`: Format date to Swiss format
- `formatTimeLabel(key, aggregation)`: Format time labels for charts

### constants.js
Contains all application constants:
- `DAYS_OF_WEEK`: Day names
- `CATEGORY_KEYWORDS`: Product categorization rules
- `ITEMS_PER_PAGE`: Pagination size
- `CHART_COLORS`: Chart color scheme
- `CHART_DEFAULTS`: Default chart options

### categorization.js
- `categorizeProduct(productName)`: Categorize product by name
- `getUniqueCategories(purchases)`: Get all categories

## Data Flow

```
CSV Files
   ↓
useTransactions (parse & store)
   ↓
purchases (raw data)
   ↓
useFilters (filter by date, category, shop)
   ↓
filteredPurchases
   ↓
┌────────────┬──────────────┐
↓            ↓              ↓
useStats    useCharts    Tab Components
↓            ↓              ↓
Statistics  Charts        UI
```

## Adding New Features

### Add a New Statistic
1. Update `useStats.js` composable
2. Add computed property
3. Use in tab component

### Add a New Chart
1. Add chart creation function in `useCharts.js`
2. Create `ChartCard` component in tab
3. Add canvas-ready event handler in tab component
4. Emit canvas-ready event to App.vue
5. Handle canvas-ready in App.vue and call chart creation function

**Example**:
```vue
<!-- In TabComponent.vue -->
<ChartCard
  title="My Chart"
  @canvas-ready="$emit('my-chart-canvas-ready', $event)"
/>

<!-- In App.vue template -->
<TabComponent
  @my-chart-canvas-ready="handleMyChartCanvasReady"
/>

<!-- In App.vue script -->
function handleMyChartCanvasReady(canvas) {
  myChart.value = canvas;
  if (filteredPurchases.value.length > 0) {
    chartComposable.createMyChart(canvas);
  }
}
```

### Add a New Tab
1. Create tab component in `components/tabs/`
2. Import in `App.vue`
3. Add to tabs array
4. Add v-show section in template

### Add a New Filter
1. Update filter state in `useFilters.js`
2. Add filter UI in `FilterSection.vue`
3. Update filtering logic in computed `filteredPurchases`

## Best Practices

1. **Always use composables for logic**: Keep components focused on presentation
2. **Use computed for derived data**: Don't duplicate calculations
3. **Keep components small**: Split if > 200 lines
4. **Use TypeScript-style JSDoc**: Document complex functions
5. **Emit events, don't mutate props**: Follow Vue patterns
6. **Use constants**: Avoid magic numbers/strings
7. **Handle loading and empty states**: Better UX
8. **Clean up on unmount**: Destroy charts, remove listeners

## Performance Considerations

- **Chart Recreation**: Charts are destroyed and recreated on filter change to avoid memory leaks
- **Pagination**: Only 50 items rendered at a time in product table
- **Computed Caching**: Expensive calculations cached automatically
- **Event-driven Chart Creation**: Charts are created only when canvas elements are ready via `canvas-ready` events
- **All Tabs Visible**: All tab content is always rendered (no v-show), ensuring charts can be properly initialized and reducing re-render overhead

## Future Improvements

1. Extract product table into separate component
2. Add unit tests for composables
3. Add E2E tests for user flows
4. Implement virtual scrolling for large datasets
5. Add data export functionality
6. Implement localStorage for filter preferences
7. Add more chart types and visualizations
