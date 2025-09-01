'use client';

import { Landmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopMinistriesData {
  label: string;
  value: number;
}

interface TopMinistriesChartProps {
  data: TopMinistriesData[];
}

export function TopMinistriesChart({ data }: TopMinistriesChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-green-600 font-semibold">
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
          <span className="text-2xl mr-3"><Landmark /></span>
          <h3 className="text-xl font-semibold text-gray-900">
            Top 5 Instituții Active
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Instituțiile cu cea mai mare activitate legislativă
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            // MODIFICARE CHEIE: Layout-ul trebuie să fie "vertical" pentru bare orizontale
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 20 }} // Am mărit marginea stângă
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              allowDecimals={false} // Nu permitem zecimale pentru numărul de acte
              label={{ 
                value: 'Număr acte', 
                position: 'insideBottom',
                offset: -10,
                style: { textAnchor: 'middle', fontSize: 12 }
              }}
            />
            <YAxis 
              type="category" 
              dataKey="label"
              tick={{ fontSize: 12, width: 200 }} // Lăsăm mai mult spațiu pentru text
              stroke="#6b7280"
              width={150} // Am mărit lățimea axei
              interval={0} // Asigură afișarea tuturor etichetelor
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Bar 
              dataKey="value" 
              fill="rgb(91 192 190)" 
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}