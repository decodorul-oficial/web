'use client';

import { LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface LegislativeActivityData {
  date: string;
  value: number;
}

interface LegislativeActivityChartProps {
  data: LegislativeActivityData[];
}

export function LegislativeActivityChart({ data }: LegislativeActivityChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">
            {new Date(label).toLocaleDateString('ro-RO', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            })}
          </p>
          <p className="text-blue-600 font-semibold">
            {payload[0].value} acte normative
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
          <span className="text-2xl mr-3"><LineChartIcon /></span>
          <h3 className="text-xl font-semibold text-gray-900">
            Evoluția Activității Legislative
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Numărul de acte normative publicate în timp
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              label={{ 
                value: 'Număr acte', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="rgb(91 192 190)" 
              strokeWidth={3}
              dot={{ fill: 'rgb(91 192 190)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'rgb(91 192 190)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
