import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import { ChartConfig, ChartData } from './WidgetRegistry'
import { DateRange } from './WidgetInterface'

export interface ChartWrapperProps {
  config: ChartConfig
  data: ChartData
  dateRange?: DateRange
}

type ChartDataPoint = {
  name: string
  [key: string]: string | number
}

export function ChartWrapper({ config, data, dateRange }: ChartWrapperProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    if (!data || !data.labels || !data.datasets) return

    // Transform the data into Recharts format
    const transformedData = data.labels.map((label, index) => ({
      name: label,
      ...data.datasets.reduce((acc, dataset) => {
        acc[dataset.label] = dataset.data[index]
        return acc
      }, {} as Record<string, number>),
    }))
    setChartData(transformedData)
  }, [data])

  if (!data || !data.labels || !data.datasets) {
    return <div>No data available</div>
  }

  const renderChart = () => {
    const commonProps = {
      margin: { top: 20, right: 30, bottom: 20, left: 20 }
    }

    switch (config.type) {
      case 'line':
        return (
          <LineChart data={chartData} {...commonProps}>
            <XAxis 
              dataKey="name"
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12 }}
              height={30}
            />
            <YAxis 
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12 }}
              width={30}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            {data.datasets.map((dataset) => (
              <Line
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stroke={dataset.borderColor?.[0] || '#4F46E5'}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        )
      case 'bar':
        return (
          <BarChart data={chartData} {...commonProps}>
            <XAxis 
              dataKey="name"
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12 }}
              height={30}
            />
            <YAxis 
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12 }}
              width={30}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            {data.datasets.map((dataset) => (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={dataset.backgroundColor?.[0] || '#4F46E5'}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        )
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={chartData}
              dataKey={data.datasets[0].label}
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#4F46E5"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={data.datasets[0].backgroundColor?.[index] || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
            />
          </PieChart>
        )
      default:
        return <div>Unsupported chart type</div>
    }
  }

  return (
    <div className="chart-wrapper w-full p-4 bg-white rounded-lg shadow-sm">
      <div className="aspect-[16/9] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      {dateRange && (
        <div className="date-range-info text-sm text-gray-500 mt-2 text-center">
          Date Range: {dateRange.startDate} to {dateRange.endDate}
        </div>
      )}
    </div>
  )
} 