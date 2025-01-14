import NavigationController from '../controllers/NavigationController'
import { ChartConfig, ChartData, Widget, WidgetRegistry, ChartArgs, createChart } from '../components/widgets/WidgetRegistry'
import React from 'react'

interface Message {
  role: 'system' | 'user' | 'assistant' | 'function'
  content: string
  name?: string
  function_call?: {
    name: string
    arguments: string
  }
}

interface FunctionDefinition {
  name: string
  description: string
  parameters: {
    type: string
    properties?: Record<string, any>
    required?: string[]
  }
}

class OpenAIService {
  private static instance: OpenAIService
  private apiKey: string
  private systemPrompt: string
  private availableFunctions: Record<string, Function> = {}
  private functionDefinitions: FunctionDefinition[] = []

  private constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || ''
    this.systemPrompt = `You are an AI assistant helping users analyze data in a dashboard application. You can create various types of charts and reports to visualize sales and revenue data. Focus on providing clear, data-driven insights through charts and visualizations.`

    this.initializeFunctions()
  }

  private initializeFunctions(): void {
    this.availableFunctions = {
      navigateToHome: () => NavigationController.navigateToHome(),
      navigateToSales: () => NavigationController.navigateToSales(),
      navigateToAccount: () => NavigationController.navigateToAccount(),
      navigateToReports: () => NavigationController.navigateToReports(),
      createChart: (args: string) => {
        console.log('OpenAIService: createChart called with args:', args)
        const parsedArgs = JSON.parse(args) as ChartArgs
        console.log('OpenAIService: parsed args:', parsedArgs)
        const result = createChart(parsedArgs)
        console.log('OpenAIService: createChart result:', result)
        return result
      }
    }

    this.functionDefinitions = [
      {
        name: 'navigateToHome',
        description: 'Navigate to the home page',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'navigateToSales',
        description: 'Navigate to the sales page',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'navigateToAccount',
        description: 'Navigate to the account page',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'navigateToReports',
        description: 'Navigate to the reports page',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'createChart',
        description: 'Create a chart widget with the specified configuration',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the chart'
            },
            description: {
              type: 'string',
              description: 'A brief description of what the chart shows'
            },
            type: {
              type: 'string',
              enum: ['line', 'bar', 'pie'],
              description: 'The type of chart to create'
            },
            metric: {
              type: 'string',
              enum: ['sales', 'revenue'],
              description: 'The metric to display in the chart'
            },
            timeframe: {
              type: 'string',
              enum: ['monthly', 'quarterly', 'yearly'],
              description: 'The time period to show data for'
            },
            dateRange: {
              type: 'object',
              properties: {
                startDate: {
                  type: 'string',
                  description: 'Start date in ISO format (YYYY-MM-DD)'
                },
                endDate: {
                  type: 'string',
                  description: 'End date in ISO format (YYYY-MM-DD)'
                }
              },
              required: ['startDate', 'endDate'],
              description: 'Optional date range to filter the data'
            }
          },
          required: ['title', 'description', 'type', 'metric', 'timeframe']
        }
      }
    ]
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService()
    }
    return OpenAIService.instance
  }

  private async executeFunction(functionName: string, args: string): Promise<string> {
    console.log('OpenAIService: executing function:', functionName)
    const func = this.availableFunctions[functionName]
    if (!func) {
      throw new Error(`Function ${functionName} not found`)
    }

    try {
      const result = await func(args)
      console.log('OpenAIService: function execution result:', result)
      return JSON.stringify(result)
    } catch (error) {
      console.error('OpenAIService: error executing function:', error)
      throw error
    }
  }

  public async sendMessage(messages: Message[]): Promise<string> {
    try {
      console.log('OpenAIService: sending message to OpenAI')
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: this.systemPrompt },
            ...messages,
          ],
          functions: this.functionDefinitions,
          function_call: 'auto',
          temperature: 0.7,
        }),
      })

      const data = await response.json()
      const message = data.choices[0].message

      if (message.function_call) {
        const functionResult = await this.executeFunction(
          message.function_call.name,
          message.function_call.arguments
        )

        messages.push({
          role: 'assistant',
          content: '',
          function_call: message.function_call,
        })
        messages.push({
          role: 'function',
          name: message.function_call.name,
          content: functionResult,
        })

        return this.sendMessage(messages)
      }

      return message.content || ''
    } catch (error) {
      console.error('Error calling OpenAI:', error)
      throw error
    }
  }
}

export default OpenAIService.getInstance() 