import { ReactNode } from 'react'
import React from 'react'
import { ChartWrapper } from './ChartWrapper'
import { DateRange } from './WidgetInterface'

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  options?: {
    responsive?: boolean
    maintainAspectRatio?: boolean
    scales?: {
      y?: {
        beginAtZero?: boolean
      }
    }
  }
}

export interface Widget {
  id: string
  title: string
  description: string
  type: string
  component: ReactNode
  config: ChartConfig
  data?: ChartData
  dateRange?: DateRange
  apiEndpoint?: string
  llmPrompt?: string
}

export interface WidgetRegistryType {
  [key: string]: Widget
}

// Initialize empty registry - widgets will be registered dynamically
export const WidgetRegistry: WidgetRegistryType = {} 

// Mock data for different metrics
const mockData = {
  sales: {
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [65, 59, 80, 81, 56, 55, 72, 68, 85, 90, 92, 95],
    },
    quarterly: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data: [204, 192, 225, 277],
    },
    yearly: {
      labels: ['2020', '2021', '2022', '2023'],
      data: [750, 898, 1020, 1150],
    },
  },
  revenue: {
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [6500, 5900, 8000, 8100, 5600, 5500, 7200, 6800, 8500, 9000, 9200, 9500],
    },
    quarterly: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data: [20400, 19200, 22500, 27700],
    },
    yearly: {
      labels: ['2020', '2021', '2022', '2023'],
      data: [75000, 89800, 102000, 115000],
    },
  },
}

export interface ChartArgs {
  title: string
  description: string
  type: 'line' | 'bar' | 'pie'
  metric: 'sales' | 'revenue'
  timeframe: 'monthly' | 'quarterly' | 'yearly'
  dateRange?: DateRange
}

export function createChart(args: ChartArgs): Widget {
  console.log('WidgetRegistry: createChart called with args:', args)
  const { title, description, type, metric, timeframe, dateRange } = args
  
  // Filter mock data based on date range if provided
  const mockMetricData = mockData[metric][timeframe]
  let filteredData: { labels: string[], data: number[] } = { ...mockMetricData }
  
  if (dateRange) {
    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)
    
    // Filter data based on timeframe and date range
    const filteredIndices = mockMetricData.labels.reduce((acc: number[], label, index) => {
      const labelDate = new Date()
      
      switch (timeframe) {
        case 'monthly': {
          // Parse month labels like 'Jan', 'Feb', etc.
          const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(label)
          // Use the year from the date range for proper filtering
          labelDate.setFullYear(startDate.getFullYear(), monthIndex, 1)
          break
        }
        case 'quarterly': {
          // Parse quarter labels like 'Q1', 'Q2', etc.
          const quarterMonth = (parseInt(label.slice(1)) - 1) * 3
          // Use the year from the date range for proper filtering
          labelDate.setFullYear(startDate.getFullYear(), quarterMonth, 1)
          break
        }
        case 'yearly': {
          // Parse year labels like '2020', '2021', etc.
          labelDate.setFullYear(parseInt(label), 0, 1)
          break
        }
      }
      
      if (labelDate >= startDate && labelDate <= endDate) {
        acc.push(index)
        console.log(`Including data point for ${label}: ${mockMetricData.data[index]}`)
      }
      return acc
    }, [])
    
    // Create filtered dataset using the filtered indices
    if (filteredIndices.length === 0) {
      console.warn('No data points found in the specified date range')
      // Return empty dataset instead of full dataset
      filteredData = {
        labels: [],
        data: []
      }
    } else {
      filteredData = {
        labels: filteredIndices.map(i => mockMetricData.labels[i]),
        data: filteredIndices.map(i => mockMetricData.data[i])
      }
    }
  }

  // Create the chart data structure
  const chartData: ChartData = {
    labels: filteredData.labels,
    datasets: [{
      label: metric.charAt(0).toUpperCase() + metric.slice(1),
      data: filteredData.data,
      backgroundColor: ['#4F46E5'],
      borderColor: ['#4F46E5']
    }]
  }

  const id = `${metric}-${timeframe}-${type}-${Date.now()}`
  const config: ChartConfig = {
    type,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  }

  const widget = {
    id,
    title,
    description,
    type: 'chart',
    component: React.createElement(ChartWrapper, { config, data: chartData, dateRange }),
    config,
    data: chartData,
    dateRange
  }

  // Store the widget in the registry
  WidgetRegistry[id] = widget

  return widget
} 