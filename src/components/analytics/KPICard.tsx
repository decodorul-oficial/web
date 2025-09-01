'use client';

import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  icon: keyof typeof LucideIcons;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function KPICard({ title, value, icon, trend, subtitle }: KPICardProps) {
  const IconComponent = LucideIcons[icon] as LucideIcon;

  const formatValue = (val: number): string => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toString();
  };

  const formatTrend = (trendValue: number): string => {
    const absValue = Math.abs(trendValue);
    if (absValue >= 1) {
      return `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(1)}%`;
    }
    return `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(2)}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">
          {IconComponent && <IconComponent size={32} className="text-gray-600" />}
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="mr-1">
              {trend.isPositive ? '↗' : '↘'}
            </span>
            {formatTrend(trend.value)}
          </div>
        )}
      </div>

      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          {title}
        </h3>
        <div className="text-3xl font-bold text-gray-900">
          {formatValue(value)}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
