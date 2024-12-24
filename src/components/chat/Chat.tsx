import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import OpenAIService from '../../services/OpenAIService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [plan, setPlan] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (message: string) => {
    setIsPending(true);
    try {
      const response = await OpenAIService.sendMessage([...messages, { role: 'user', content: message }]);
      if (response.toLowerCase().includes('plan:')) {
        setPlan(response);
      } else {
        setMessages(prev => [...prev, 
          { role: 'user', content: message },
          { role: 'assistant', content: response }
        ]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleProceed = async () => {
    if (plan) {
      setIsPending(true);
      try {
        const response = await OpenAIService.proceedWithPlan(messages);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setPlan(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-120px)]">
      <ScrollArea className="flex-grow p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'ml-auto' : 'mr-auto'
            } max-w-[80%]`}
          >
            <Card className={`p-3 ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary'
            }`}>
              {message.content}
            </Card>
          </div>
        ))}
      </ScrollArea>

      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            name="message"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            Send
          </Button>
        </div>
      </form>

      {plan && (
        <Dialog open={!!plan} onOpenChange={() => setPlan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Proposed Plan</DialogTitle>
            </DialogHeader>
            <div className="py-4">{plan}</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPlan(null)}>
                Cancel
              </Button>
              <Button onClick={handleProceed} disabled={isPending}>
                Proceed with Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default Chat; 