export const NEWS_VIEW_PERIODS = {
  '1d': {
    value: '1d',
    label: 'Today',
    labelRo: 'Astăzi',
    description: 'Most read news from the last 24 hours'
  },
  '7d': {
    value: '7d',
    label: 'This Week',
    labelRo: 'Această săptămână',
    description: 'Most read news from the last 7 days'
  },
  '30d': {
    value: '30d',
    label: 'This Month',
    labelRo: 'Luna aceasta',
    description: 'Most read news from the last 30 days'
  },
  '365d': {
    value: '365d',
    label: 'This Year',
    labelRo: 'Anul acesta',
    description: 'Most read news from the last 365 days'
  },
  'all': {
    value: 'all',
    label: 'All Time',
    labelRo: 'Toate timpurile',
    description: 'Most read news of all time'
  }
} as const;

export type NewsViewPeriod = keyof typeof NEWS_VIEW_PERIODS;

export function getPeriodConfig(period: NewsViewPeriod) {
  return NEWS_VIEW_PERIODS[period];
}

export function getDefaultPeriod(): NewsViewPeriod {
  return '7d';
}
