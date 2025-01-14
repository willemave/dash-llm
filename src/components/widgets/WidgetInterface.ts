export interface DateRange {
  startDate: string
  endDate: string
}

export interface WidgetInterface {
  id: string
  title: string
  dateRange?: DateRange
  render: () => JSX.Element
}

export type WidgetType = WidgetInterface 