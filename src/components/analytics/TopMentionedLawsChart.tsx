'use client';

import { Scale } from 'lucide-react';
import { useMemo } from 'react';

interface TopMentionedLawsData {
  label: string;
  value: number;
}

interface TopMentionedLawsChartProps {
  data: TopMentionedLawsData[];
}

export function TopMentionedLawsChart({ data }: TopMentionedLawsChartProps) {
  // Calculăm valoarea maximă pentru a scala barele inline corect
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map(item => item.value));
  }, [data]);

  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3"><Scale /></span>
          <h3 className="text-xl font-semibold text-gray-900">
            Top Legi Menționate
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Legile cu cele mai multe menționări în actele normative
        </p>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => {
          // Calculăm lățimea barei ca procentaj față de valoarea maximă
          const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700 truncate" title={item.label}>
                  {index + 1}. {item.label}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {item.value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                               <div
                 className="bg-brand-info h-2 rounded-full transition-all duration-300 ease-out"
                 style={{ width: `${barWidth}%` }}
               ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}