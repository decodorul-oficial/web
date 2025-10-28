'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface NewsStatsData {
  period: string;
  count: number;
  date?: string;
  isBenchmark?: boolean;
}

interface NewsStatsChartProps {
  data: NewsStatsData[];
  chartType: 'bar' | 'line';
  title: string;
}

export function NewsStatsChart({ data, chartType, title }: NewsStatsChartProps) {
  // Separate current data from benchmark data
  const currentData = data.filter(item => !item.isBenchmark);
  const benchmarkData = data.filter(item => item.isBenchmark);
  
  // For bar charts, we need to combine data by period
  const combinedData = chartType === 'bar' ? 
    currentData.map(item => {
      const benchmarkItem = benchmarkData.find(b => b.period === item.period);
      return {
        ...item,
        benchmarkCount: benchmarkItem?.count || 0
      };
    }) : data;

  // Calculate proper scaling for Y-axis
  const allValues = data.map(item => item.count);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  
  // Ensure minimum range for better visualization
  const range = maxValue - minValue;
  const padding = range > 0 ? Math.ceil(range * 0.1) : 1;
  const yAxisDomain = [
    Math.max(0, minValue - padding),
    maxValue + padding
  ];

  return (
    <div className="h-64 w-full">
      <div className="mb-2">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        {benchmarkData.length > 0 && (
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-teal-500 rounded"></div>
              <span className="text-xs text-gray-600">Perioada curentă</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span className="text-xs text-gray-600">Perioada anterioară</span>
            </div>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'bar' ? (
          <BarChart
            data={combinedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              domain={yAxisDomain}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{
                color: '#374151',
                fontWeight: '600',
              }}
              formatter={(value: number, name: string) => [
                value, 
                name === 'count' ? 'Știri (curente)' : 'Știri (anterioare)'
              ]}
            />
            <Bar 
              dataKey="count" 
              fill="rgb(91 192 190)" 
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
            {benchmarkData.length > 0 && (
              <Bar 
                dataKey="benchmarkCount" 
                fill="rgb(156 163 175)" 
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            )}
          </BarChart>
        ) : (
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              axisLine={{ stroke: '#d1d5db' }}
              domain={yAxisDomain}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{
                color: '#374151',
                fontWeight: '600',
              }}
              formatter={(value: number, name: string) => [
                value, 
                name === 'count' ? 'Știri (curente)' : 'Știri (anterioare)'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="rgb(91 192 190)" 
              strokeWidth={3}
              dot={{ fill: 'rgb(91 192 190)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'rgb(91 192 190)', strokeWidth: 2 }}
            />
            {benchmarkData.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="rgb(156 163 175)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'rgb(156 163 175)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'rgb(156 163 175)', strokeWidth: 2 }}
                data={benchmarkData}
              />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
