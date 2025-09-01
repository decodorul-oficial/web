'use client';

import { KeyRound } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopKeywordsData {
  label: string;
  value: number;
}

interface TopKeywordsChartProps {
  data: TopKeywordsData[];
}

export function TopKeywordsChart({ data }: TopKeywordsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-brand-info font-semibold">
            {payload[0].value} apariții
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3"><KeyRound /></span>
          <h3 className="text-xl font-semibold text-gray-900">
            Top 10 Cuvinte Cheie Frecvente
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Cuvintele cheie cele mai frecvente în actele normative
        </p>
      </div>

      <div className="h-80"> {/* Am mărit puțin înălțimea pentru a face loc etichetelor înclinate */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 5, right: 20, left: 0, bottom: 80 }} // Margine mare jos pentru etichete
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={(props) => {
                const { x, y, payload } = props;
                const label =
                  typeof payload.value === 'string'
                    ? payload.value.charAt(0).toUpperCase() + payload.value.slice(1)
                    : payload.value;
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor="end"
                    fontSize={12}
                    fill="#6b7280"
                    transform={`rotate(-45, ${x}, ${y})`}
                  >
                    {label}
                  </text>
                );
              }}
              stroke="#6b7280"
              interval={0}
            />
            <YAxis 
              type="number"
              stroke="#6b7280"
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  const formattedLabel =
                    typeof label === 'string'
                      ? label.charAt(0).toUpperCase() + label.slice(1)
                      : label;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-medium text-gray-900 mb-1">{formattedLabel}</p>
                      <p className="text-brand-info font-semibold">
                        {payload[0].value} apariții
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: '#f3f4f6' }}
            />
            <Bar 
              dataKey="value" 
              fill="rgb(91 192 190)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}