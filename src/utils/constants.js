export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAYS_OF_WEEK_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export const CATEGORY_KEYWORDS = {
  'Pain': ['pain', 'toast', 'baguette'],
  'Fromage': ['fromage', 'cheese', 'gruyère'],
  'Produits laitiers': ['lait', 'crème', 'yogourt'],
  'Viande': ['poulet', 'viande', 'jambon', 'saucisse'],
  'Poisson': ['poisson', 'truite', 'saumon'],
  'Légumes': ['tomate', 'carotte', 'poireau', 'légume'],
  'Fruits': ['banane', 'pomme', 'raisin', 'fruit'],
  'Pâtes & riz': ['pâte', 'riz', 'pasta'],
  'Sucreries': ['chocolat', 'bonbon', 'dessert'],
  'Boissons': ['eau', 'drink', 'jus']
};

export const ITEMS_PER_PAGE = 50;

export const TIME_AGGREGATIONS = [
  { value: 'day', label: 'By day' },
  { value: 'week', label: 'By week' },
  { value: 'month', label: 'By month' },
  { value: 'year', label: 'By year' }
];

export const SORT_OPTIONS = [
  { value: 'date', label: 'Trier par date' },
  { value: 'price', label: 'Trier par prix' },
  { value: 'quantity', label: 'Trier par quantité' },
  { value: 'name', label: 'Trier par nom' }
];

export const CHART_COLORS = {
  primary: '#ff6b35',
  secondary: '#ff8c61',
  gradient: [
    '#ff6b35', '#ff8c61', '#ffad8d', '#ffc3a8',
    '#ffd9c3', '#ffe8db', '#fff5f0', '#ffeee6',
    '#ffe0d1', '#ffd4bc'
  ]
};

export const CHART_DEFAULTS = {
  animation: {
    duration: 1000,
    easing: 'easeOutQuart'
  },
  responsive: true,
  maintainAspectRatio: false
};
