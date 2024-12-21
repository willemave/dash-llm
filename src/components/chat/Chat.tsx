import React, { useState, useRef, useEffect } from 'react';
import OpenAIService from '../../services/OpenAIService';
import './Chat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleProceed = async () => {
    if (!plan) return;

    setIsLoading(true);
    try {
      // Add the plan as an assistant message
      const planMessage: Message = {
        role: 'assistant',
        content: plan
      };
      
      // Add user confirmation message
      const confirmMessage: Message = {
        role: 'user',
        content: 'Proceed with the plan'
      };

      setMessages(prev => [...prev, planMessage, confirmMessage]);
      
      // Execute the plan
      const response = await OpenAIService.proceedWithPlan([...messages, planMessage, confirmMessage]);
      
      // Add the response
      const responseMessage: Message = {
        role: 'assistant',
        content: response
      };
      
      setMessages(prev => [...prev, responseMessage]);
      setPlan(null);
    } catch (error) {
      console.error('Error executing plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await OpenAIService.sendMessage([...messages, userMessage]);
      if (response.toLowerCase().includes('plan:')) {
        setPlan(response);
      } else {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error getting response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
          >
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {plan && (
        <div className="overlay" onClick={() => setPlan(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="plan-content">
              <h3>Proposed Plan:</h3>
              <p>{plan}</p>
              <div className="plan-actions">
                <button 
                  className="proceed-button" 
                  onClick={handleProceed}
                  disabled={isLoading}
                >
                  Proceed with Plan
                </button>
                <button 
                  className="cancel-button" 
                  onClick={() => setPlan(null)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!plan && (
        <form className="input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputMessage.trim()}>
            Send
          </button>
        </form>
      )}
    </div>
  );
};

export default Chat; 