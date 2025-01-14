import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { WidgetContainer } from '../widgets/WidgetContainer'
import { SalesChartWidget } from '../widgets/SalesChart'
import { Widget, WidgetRegistry } from '../widgets/WidgetRegistry'

function Reports() {
  const [widgets, setWidgets] = useState<Widget[]>([])

  // Update widgets when component mounts
  useEffect(() => {
    const registryWidgets = Object.values(WidgetRegistry)
    console.log('Reports: Current registry widgets:', registryWidgets)
    setWidgets(registryWidgets)
  }, [])

  // Set up an interval to check for new widgets
  useEffect(() => {
    const intervalId = setInterval(() => {
      const registryWidgets = Object.values(WidgetRegistry)
      setWidgets((prev) => {
        // Only add widgets that aren't already in the state
        const newWidgets = registryWidgets.filter(
          (widget) => !prev.some((w) => w.id === widget.id)
        )
        if (newWidgets.length > 0) {
          console.log('Reports: Found new widgets:', newWidgets)
          return [...prev, ...newWidgets]
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <WidgetContainer key={widget.id} widget={widget} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Reports