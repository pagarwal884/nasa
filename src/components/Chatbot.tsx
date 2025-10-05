import { useState, useRef, useEffect } from "react";
import { Send, Rocket, Loader2, Bot, User } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";

interface Message {
  role: "user" | "bot";
  content: string;
  isLoading?: boolean;
}

interface ChatbotProps {
  documentTitle: string;
}

export const Chatbot = ({ documentTitle }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "bot", 
      content: `Hello! I'm your research assistant for "${documentTitle}". I can help you analyze findings, understand methodologies, and explore key insights from this research paper. How can I assist you today?` 
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const CHATBOT_API_ENDPOINT = "https://nasa-hackathon-backend-a-cube.onrender.com/ai-chat";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isThinking]);

  const extractResponseContent = (data: any): string => {
    // If it's already a string, return it directly
    if (typeof data === 'string') {
      return data;
    }
    
    // If it's an object, look for common response fields
    if (typeof data === 'object' && data !== null) {
      // Try common response field names in priority order
      const responseFields = [
        'response', 'message', 'answer', 'text', 'content', 
        'reply', 'output', 'result', 'ai_response'
      ];
      
      for (const field of responseFields) {
        if (data[field] && typeof data[field] === 'string') {
          return data[field];
        }
      }
      
      // If no common fields found but object has content, try to extract meaningful text
      const stringData = JSON.stringify(data);
      if (stringData.length < 500) { // Avoid showing large objects
        // Look for any string values that might be the response
        for (const key in data) {
          if (typeof data[key] === 'string' && data[key].length > 10) {
            return data[key];
          }
        }
      }
    }
    
    // Fallback message
    return "I've analyzed your query about the research. Is there anything specific you'd like to know more about?";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsThinking(true);

    try {
      console.log("Sending request to API:", {
        message: input.trim(),
        documentTitle: documentTitle
      });

      const response = await fetch(CHATBOT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          documentTitle: documentTitle,
        }),
      });

      console.log("API Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Raw API response:", responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      console.log("Parsed API data:", data);
      
      // Extract only the response content, not the whole object
      const botContent = extractResponseContent(data);

      const botResponse: Message = {
        role: "bot",
        content: botContent
      };
      
      setMessages((prev) => [...prev, botResponse]);

    } catch (error) {
      console.error("Error calling chatbot API:", error);
      
      let errorMessage = "I apologize, but I'm having trouble connecting to the research database right now. ";
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage += "Network connection failed. Please check your internet connection.";
        } else if (error.message.includes('HTTP error')) {
          errorMessage += "Server error occurred. Please try again later.";
        } else if (error.message.includes('JSON')) {
          errorMessage += "Invalid response format from server.";
        } else {
          errorMessage += `Error: ${error.message}`;
        }
      } else {
        errorMessage += "An unexpected error occurred.";
      }
      
      const errorResponse: Message = {
        role: "bot",
        content: errorMessage
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Thinking animation component
  const ThinkingAnimation = () => (
    <div className="flex items-center gap-3">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-white/70 text-sm">Analyzing research data...</span>
    </div>
  );

  return (
    <div 
      className="fixed right-6 w-96 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col z-50"
      style={{
        top: '100px',
        bottom: '24px',
        height: 'calc(100vh - 124px)'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-lg p-5 border-b border-white/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Research Assistant</h3>
            <p className="text-white/70 text-xs">AI analysis for {documentTitle}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                message.role === "user" 
                  ? "bg-blue-500/20 border border-blue-400/30" 
                  : "bg-purple-500/20 border border-purple-400/30"
              }`}>
                {message.role === "user" ? (
                  <User className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={`max-w-[78%] rounded-xl p-3 backdrop-blur-sm border ${
                message.role === "user" 
                  ? "bg-blue-500/20 border-blue-400/30" 
                  : "bg-purple-500/20 border-purple-400/30"
              }`}>
                {/* Sender Name */}
                <div className="font-semibold text-xs mb-1 text-white/90">
                  {message.role === "user" ? "You" : "Research Assistant"}
                </div>
                
                {/* Message Content */}
                <div className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap break-words">
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-purple-500/20 border border-purple-400/30">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="max-w-[78%] rounded-xl p-3 backdrop-blur-sm border bg-purple-500/20 border-purple-400/30">
                <div className="font-semibold text-xs mb-1 text-white/90">
                  Research Assistant
                </div>
                <ThinkingAnimation />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-lg border-t border-white/20 flex-shrink-0">
        <div className="relative">
          <Input
            type="text"
            placeholder="Ask about the research..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || isThinking}
            className="w-full pr-10 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 text-sm disabled:opacity-50 transition-all duration-200"
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={isLoading || isThinking || !input.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 w-7 h-7 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading || isThinking ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};