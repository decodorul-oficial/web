'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
interface CategoryDistributionData {
  label: string;
  value: number;
}

interface CategoryDistributionChartProps {
  data: CategoryDistributionData[];
}

const COLORS = [
  'rgb(91 192 190)',    // Turcoaz principal
  'rgb(45 167 165)',    // Turcoaz foarte închis - contrast mare
  'rgb(140 217 215)',   // Turcoaz foarte deschis - contrast mare
  'rgb(25 152 150)',    // Turcoaz extrem de închis - accent
  'rgb(160 227 225)',   // Turcoaz extrem de deschis - evidențiere
  'rgb(70 177 175)',    // Turcoaz închis - echilibru
  'rgb(120 207 205)',   // Turcoaz deschis - varietate
  'rgb(55 162 160)',    // Turcoaz mediu închis - profunzime
  'rgb(150 222 220)',   // Turcoaz mediu deschis - claritate
  'rgb(35 142 140)',    // Turcoaz foarte închis - contrast
];

// O funcție ajutătoare pentru a curăța etichetele
const normalizeLabel = (label: string) => {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const { processedData, totalValue } = useMemo(() => {
    if (!data) return { processedData: [], totalValue: 0 };

    const aggregationMap = new Map<string, number>();
    data.forEach(item => {
      const normalized = normalizeLabel(item.label);
      const currentValue = aggregationMap.get(normalized) || 0;
      aggregationMap.set(normalized, currentValue + item.value);
    });
    
    const aggregated = Array.from(aggregationMap.entries()).map(([label, value]) => ({
      label: data.find(d => normalizeLabel(d.label) === label)?.label || label,
      value,
    }));
    
    // NOU: Logica pentru a sorta și a grupa categoriile mici
    const sortedData = aggregated.sort((a, b) => b.value - a.value);
    const topCategoriesCount = 8; // Afișăm top 8 categorii
    let finalData = sortedData;

    if (sortedData.length > topCategoriesCount + 1) {
      const topData = sortedData.slice(0, topCategoriesCount);
      const otherData = sortedData.slice(topCategoriesCount);
      const otherValue = otherData.reduce((sum, item) => sum + item.value, 0);

      finalData = [
        ...topData,
        { label: 'Altele', value: otherValue },
      ];
    }
    
    const total = finalData.reduce((sum, item) => sum + item.value, 0);
    
    return { processedData: finalData, totalValue: total };
  }, [data]);

  const CustomTooltip =  ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      const percentage = totalValue > 0 ? ((dataItem.value / totalValue) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">
            {dataItem.label.charAt(0).toUpperCase() + dataItem.label.slice(1)}
          </p>
          <p className="text-brand-info font-semibold">
            {dataItem.value} acte normative
          </p>
          <p className="text-gray-600 text-sm">
            {percentage}% din total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: { payload?: { color: string, value: string }[] }) => {
    if (!payload || payload.length === 0) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {payload.map((entry: { color: string, value: string }, index: number) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">
              {entry.value.charAt(0).toUpperCase() + entry.value.slice(1)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3"><PieChartIcon /></span>
          <h3 className="text-xl font-semibold text-gray-900">
            Distribuția Actelor pe Categorii
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Repartizarea actelor normative pe categorii legislative
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedData} // Folosim datele procesate
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="label"
            >
              {processedData.map((_entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}