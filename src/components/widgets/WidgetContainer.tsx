import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Widget } from './WidgetRegistry'

interface WidgetContainerProps {
  widget: Widget
  onRefresh?: () => void
  onRemove?: () => void
}

export function WidgetContainer({ widget, onRefresh, onRemove }: WidgetContainerProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          <CardDescription>{widget.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          {widget.component}
        </div>
      </CardContent>
    </Card>
  )
} 