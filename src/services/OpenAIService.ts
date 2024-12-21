import NavigationController from "controllers/NavigationController";
import { SalesData } from '../components/pages/Sales';

interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;
  private systemPrompt: string = `You are an AI assistant helping users navigate and use a dashboard application.
Before executing any navigation or complex actions, you must:
1. Start your response with "Plan:" followed by a brief outline of what you intend to do
2. Wait for user confirmation before proceeding
3. After confirmation, execute the planned actions

Example:
User: "Can you take me to the sales page?"
Assistant: "Plan: I will navigate to the Sales page using the navigation system."
[User confirms]
Assistant: "Navigating to Sales page now... Done! You're now on the Sales page."`;
  private availableFunctions: Record<string, Function> = {};
  private functionDefinitions: FunctionDefinition[] = [];

  private constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    this.initializeFunctions();
  }

  private initializeFunctions() {
    // Define available functions
    this.availableFunctions = {
      navigateToHome: () => NavigationController.navigateToHome(),
      navigateToSales: () => NavigationController.navigateToSales(),
      navigateToAccount: () => NavigationController.navigateToAccount(),
      updateChartData: (newData: SalesData[]) => this.updateChartData(newData),
      changeLocation: (args: { location: string }) => {
        if ((window as any).changeLocation) {
          return (window as any).changeLocation(args.location);
        }
        return false;
      },
    };

    // Define function schemas for OpenAI
    this.functionDefinitions = [
      {
        name: "navigateToHome",
        description: "Navigate to the home page",
        parameters: { type: "object", properties: {} }
      },
      {
        name: "navigateToSales",
        description: "Navigate to the sales page",
        parameters: { type: "object", properties: {} }
      },
      {
        name: "navigateToAccount",
        description: "Navigate to the account page",
        parameters: { type: "object", properties: {} }
      },
      {
        name: "updateChartData",
        description: "Update the sales chart data with new data",
        parameters: {
          type: "object",
          properties: {
            newData: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  location: { type: "string" },
                  sales: { type: "number" }
                },
                required: ["date", "location", "sales"]
              }
            }
          },
          required: ["newData"]
        }
      },
      {
        name: "changeLocation",
        description: "Change the current location filter in the sales view",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The location to filter by (e.g., 'New York', 'London', 'All Locations')"
            }
          },
          required: ["location"]
        }
      }
    ];
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  private async executeFunction(functionName: string, args: string): Promise<string> {
    const func = this.availableFunctions[functionName];
    if (!func) {
      throw new Error(`Function ${functionName} not found`);
    }
    
    const result = await func(JSON.parse(args));
    return JSON.stringify(result);
  }

  private updateChartData(newData: SalesData[]): void {
    // Expose the API to update chart data
    if ((window as any).updateChartData) {
      (window as any).updateChartData(newData);
    }
  }

  public async sendMessage(messages: Message[]): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: this.systemPrompt },
            ...messages
          ],
          functions: this.functionDefinitions,
          function_call: 'auto',
          temperature: 0.7
        })
      });

      const data = await response.json();
      const message = data.choices[0].message;

      // Check if the message contains a function call
      if (message.function_call) {
        const functionResult = await this.executeFunction(
          message.function_call.name,
          message.function_call.arguments
        );

        // Add function call and result to messages
        messages.push({
          role: 'assistant',
          content: '',
          function_call: message.function_call
        });
        messages.push({
          role: 'function',
          name: message.function_call.name,
          content: functionResult
        });

        // Make a follow-up call to get the final response
        return this.sendMessage(messages);
      }

      // Check if the message contains a plan (after function handling)
      if (message.content && message.content.toLowerCase().includes('plan:')) {
        return message.content;
      }

      return message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw error;
    }
  }

  public async proceedWithPlan(messages: Message[]): Promise<string> {
    // Filter out the "Plan:" prefix for the execution
    const lastMessage = messages[messages.length - 1];
    const executionMessages = messages.map(msg => {
      if (msg === lastMessage && msg.content.toLowerCase().includes('plan:')) {
        return {
          ...msg,
          content: msg.content.replace(/^Plan:\s*/i, '')
        };
      }
      return msg;
    });

    return this.sendMessage(executionMessages);
  }
}

export default OpenAIService.getInstance(); 