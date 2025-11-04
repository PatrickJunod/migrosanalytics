import { ref, watch, nextTick } from 'vue';
import { Chart } from 'chart.js';
import { formatCurrency, formatTimeLabel } from '../utils/formatters';
import { CHART_COLORS, CHART_DEFAULTS, DAYS_OF_WEEK_SHORT } from '../utils/constants';
import { categorizeProduct } from '../utils/categorization';

export function useCharts(filteredPurchases) {
  const charts = ref({});

  /**
   * Safely destroy a chart
   * @param {string} chartName - The chart name
   */
  function destroyChart(chartName) {
    if (charts.value[chartName]) {
      try {
        // Stop any pending animations before destroying
        charts.value[chartName].stop();
        charts.value[chartName].destroy();
      } catch (e) {
        console.warn(`Error destroying ${chartName} chart:`, e);
      }
      charts.value[chartName] = null;
    }
  }

  /**
   * Destroy all charts
   */
  function destroyAllCharts() {
    Object.keys(charts.value).forEach(chartName => {
      destroyChart(chartName);
    });
    charts.value = {};
  }

  /**
   * Validate canvas element
   * @param {HTMLElement} canvas - The canvas element
   * @param {string} chartName - The chart name for logging
   * @returns {CanvasRenderingContext2D|null}
   */
  function validateCanvas(canvas, chartName) {
    if (!canvas || !canvas.getContext) {
      console.warn(`${chartName} chart canvas not available`);
      return null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn(`Could not get 2d context for ${chartName} chart`);
      return null;
    }

    return ctx;
  }

  /**
   * Create monthly expenses chart
   * @param {HTMLElement} canvas - Canvas element
   */
  function createMonthlyChart(canvas) {
    if (!canvas || filteredPurchases.value.length === 0) {
      return;
    }

    const ctx = validateCanvas(canvas, 'monthly');
    if (!ctx) {
      return;
    }

    destroyChart('monthly');

    const monthlyData = {};
    filteredPurchases.value.forEach(p => {
      const month = p.date.substring(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + p.price;
    });

    const sortedMonths = Object.keys(monthlyData).sort();

    try {
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
            backgroundColor: CHART_COLORS.primary,
            borderColor: CHART_COLORS.primary,
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          ...CHART_DEFAULTS,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#2a2a2a' },
              ticks: {
                color: '#a0a0a0',
                callback: value => formatCurrency(value)
              }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#a0a0a0' }
            }
          }
        }
      });
    } catch (error) {
      console.warn('Error creating monthly chart:', error);
    }
  }

  /**
   * Create category distribution chart
   * @param {HTMLElement} canvas - Canvas element
   */
  function createCategoryChart(canvas) {
    if (!canvas || filteredPurchases.value.length === 0) return;

    const ctx = validateCanvas(canvas, 'category');
    if (!ctx) return;

    destroyChart('category');

    const categories = {};
    filteredPurchases.value.forEach(p => {
      const category = categorizeProduct(p.product);
      categories[category] = (categories[category] || 0) + p.price;
    });

    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    try {
      charts.value.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: topCategories.map(c => c[0]),
          datasets: [{
            data: topCategories.map(c => c[1]),
            backgroundColor: CHART_COLORS.gradient,
            borderWidth: 0
          }]
        },
        options: {
          ...CHART_DEFAULTS,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#a0a0a0',
                padding: 15,
                font: { size: 12 }
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
    } catch (error) {
      console.warn('Error creating category chart:', error);
    }
  }

  /**
   * Aggregate data by time period
   * @param {Array} data - Purchase data
   * @param {string} aggregation - Time aggregation type
   * @returns {Object} Aggregated data
   */
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

  /**
   * Get ISO week number
   * @param {Date} date - The date
   * @returns {number} ISO week number
   */
  function getISOWeek(date) {
    const tempDate = new Date(date.getTime());
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  /**
   * Create timeline chart
   * @param {HTMLElement} canvas - Canvas element
   * @param {string} timeAggregation - Time aggregation type
   */
  function createTimelineChart(canvas, timeAggregation) {
    if (!canvas || filteredPurchases.value.length === 0) return;

    const ctx = validateCanvas(canvas, 'timeline');
    if (!ctx) return;

    destroyChart('timeline');

    const aggregatedData = aggregateDataByTime(filteredPurchases.value, timeAggregation);
    const sortedKeys = Object.keys(aggregatedData).sort();

    try {
      charts.value.timeline = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedKeys.map(key => formatTimeLabel(key, timeAggregation)),
          datasets: [{
            label: 'Expenses',
            data: sortedKeys.map(key => aggregatedData[key]),
            borderColor: CHART_COLORS.primary,
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: timeAggregation === 'day' ? 0 : 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          ...CHART_DEFAULTS,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: timeAggregation !== 'day',
                color: '#2a2a2a'
              },
              ticks: {
                color: '#a0a0a0',
                maxTicksLimit: timeAggregation === 'day' ? 15 : 10
              }
            },
            y: {
              beginAtZero: true,
              grid: { color: '#2a2a2a' },
              ticks: {
                color: '#a0a0a0',
                callback: value => formatCurrency(value)
              }
            }
          }
        }
      });
    } catch (error) {
      console.warn('Error creating timeline chart:', error);
    }
  }

  /**
   * Create day of week chart
   * @param {HTMLElement} canvas - Canvas element
   */
  function createDayOfWeekChart(canvas) {
    if (!canvas || filteredPurchases.value.length === 0) return;

    const ctx = validateCanvas(canvas, 'dayOfWeek');
    if (!ctx) return;

    destroyChart('dayOfWeek');

    const dayData = [0, 0, 0, 0, 0, 0, 0];
    filteredPurchases.value.forEach(p => {
      const day = new Date(p.date).getDay();
      dayData[day] += p.price;
    });

    try {
      charts.value.dayOfWeek = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: DAYS_OF_WEEK_SHORT,
          datasets: [{
            label: 'Expenses',
            data: dayData,
            backgroundColor: CHART_COLORS.primary,
            borderRadius: 4
          }]
        },
        options: {
          ...CHART_DEFAULTS,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#2a2a2a' },
              ticks: {
                color: '#a0a0a0',
                callback: value => formatCurrency(value)
              }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#a0a0a0' }
            }
          }
        }
      });
    } catch (error) {
      console.warn('Error creating day of week chart:', error);
    }
  }

  /**
   * Create hour chart
   * @param {HTMLElement} canvas - Canvas element
   */
  function createHourChart(canvas) {
    if (!canvas || filteredPurchases.value.length === 0) return;

    const ctx = validateCanvas(canvas, 'hour');
    if (!ctx) return;

    destroyChart('hour');

    const hourData = new Array(24).fill(0);
    filteredPurchases.value.forEach(p => {
      if (p.time) {
        const hour = parseInt(p.time.split(':')[0]);
        hourData[hour] += p.price;
      }
    });

    try {
      charts.value.hour = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({length: 24}, (_, i) => `${i}h`),
          datasets: [{
            label: 'Expenses',
            data: hourData,
            borderColor: CHART_COLORS.primary,
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6
          }]
        },
        options: {
          ...CHART_DEFAULTS,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#2a2a2a' },
              ticks: {
                color: '#a0a0a0',
                callback: value => formatCurrency(value)
              }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#a0a0a0' }
            }
          }
        }
      });
    } catch (error) {
      console.warn('Error creating hour chart:', error);
    }
  }

  /**
   * Create store distribution chart
   * @param {HTMLElement} canvas - Canvas element
   */
  function createStoreChart(canvas) {
    if (!canvas || filteredPurchases.value.length === 0) return;

    const ctx = validateCanvas(canvas, 'store');
    if (!ctx) return;

    destroyChart('store');

    const storeData = {};
    filteredPurchases.value.forEach(p => {
      storeData[p.store] = (storeData[p.store] || 0) + p.price;
    });

    const sortedStores = Object.entries(storeData)
      .sort((a, b) => b[1] - a[1]);

    try {
      charts.value.store = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedStores.map(s => s[0]),
          datasets: [{
            label: 'Expenses',
            data: sortedStores.map(s => s[1]),
            backgroundColor: CHART_COLORS.primary,
            borderRadius: 4
          }]
        },
        options: {
          ...CHART_DEFAULTS,
          indexAxis: 'y',
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: '#2a2a2a' },
              ticks: {
                color: '#a0a0a0',
                callback: value => formatCurrency(value)
              }
            },
            y: {
              grid: { display: false },
              ticks: { color: '#a0a0a0' }
            }
          }
        }
      });
    } catch (error) {
      console.warn('Error creating store chart:', error);
    }
  }

  return {
    charts,
    createMonthlyChart,
    createCategoryChart,
    createTimelineChart,
    createDayOfWeekChart,
    createHourChart,
    createStoreChart,
    destroyAllCharts
  };
}
