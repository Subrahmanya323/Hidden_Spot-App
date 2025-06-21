export const CATEGORIES = {
  ROMANTIC: 'Romantic',
  SERENE: 'Serene',
  CREATIVE: 'Creative',
  ADVENTURE: 'Adventure',
  FOOD: 'Food',
  OTHER: 'Other',
};

export const CATEGORY_CONFIG = {
  [CATEGORIES.ROMANTIC]: {
    icon: 'heart',
    emoji: '❤️',
    color: '#F4A6CD',
    markerColor: '#E91E63',
    description: 'Perfect for romantic moments and dates',
  },
  [CATEGORIES.SERENE]: {
    icon: 'leaf',
    emoji: '🌿',
    color: '#95D5B2',
    markerColor: '#4CAF50',
    description: 'Peaceful and quiet places for relaxation',
  },
  [CATEGORIES.CREATIVE]: {
    icon: 'palette',
    emoji: '🎨',
    color: '#8B7EC8',
    markerColor: '#9C27B0',
    description: 'Inspiring locations for artists and creators',
  },
  [CATEGORIES.ADVENTURE]: {
    icon: 'terrain',
    emoji: '🏔️',
    color: '#FFB347',
    markerColor: '#FF9800',
    description: 'Exciting and adventurous spots',
  },
  [CATEGORIES.FOOD]: {
    icon: 'food',
    emoji: '🍽️',
    color: '#FF6B6B',
    markerColor: '#F44336',
    description: 'Hidden culinary gems and food spots',
  },
  [CATEGORIES.OTHER]: {
    icon: 'star',
    emoji: '⭐',
    color: '#A8A4D9',
    markerColor: '#607D8B',
    description: 'Other unique and interesting places',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const getCategoryConfig = (category) => {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG[CATEGORIES.OTHER];
};

export const getCategoryColor = (category) => {
  return getCategoryConfig(category).color;
};

export const getCategoryIcon = (category) => {
  return getCategoryConfig(category).icon;
};

export const getCategoryEmoji = (category) => {
  return getCategoryConfig(category).emoji;
};

export const getMarkerColor = (category) => {
  return getCategoryConfig(category).markerColor;
}; 