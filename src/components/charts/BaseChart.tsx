import React from 'react';
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';

export interface BaseChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  chartColor?: string;
}

const BaseChart: React.FC<BaseChartProps> = ({
  data,
  xKey,
  yKey,
  chartColor = '#8884d8'
}) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={yKey} fill={chartColor} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BaseChart; 