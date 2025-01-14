import { ChartWrapper } from './ChartWrapper'
import { Widget } from './WidgetRegistry'

const sampleData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Sales',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: ['#4F46E5'],
      backgroundColor: ['#4F46E5'],
    },
    {
      label: 'Revenue',
      data: [28, 48, 40, 19, 86, 27],
      borderColor: ['#10B981'],
      backgroundColor: ['#10B981'],
    },
  ],
}

const sampleConfig = {
  type: 'line' as const,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
}

export const SalesChartWidget: Widget = {
  id: 'sales-chart',
  title: 'Sales Overview',
  description: 'Monthly sales and revenue comparison',
  type: 'chart',
  component: <ChartWrapper config={sampleConfig} data={sampleData} />,
  config: sampleConfig,
  data: sampleData,
  llmPrompt: 'Show me a comparison of sales and revenue over time',
} 