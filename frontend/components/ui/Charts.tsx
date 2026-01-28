'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface ChartProps {
  data: any[];
  type?: 'line' | 'area';
  color?: string;
  height?: number;
}

export function CyberChart({ data, type = 'line', color = '#00f7ff', height = 300 }: ChartProps) {
  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div style={{ height: height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1f" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#475569" 
            tick={{ fill: '#475569', fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#475569" 
            tick={{ fill: '#475569', fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0a0a0f', 
              borderColor: '#1a1a1f', 
              color: '#fff',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)'
            }}
            itemStyle={{ color: color }}
          />
          <DataComponent 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            fill={type === 'area' ? "url(#colorGradient)" : undefined}
            dot={{ r: 4, fill: '#0a0a0f', stroke: color, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: color, stroke: '#fff' }}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
