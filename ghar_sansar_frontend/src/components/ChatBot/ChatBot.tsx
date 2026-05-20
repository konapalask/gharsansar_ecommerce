import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your Gharsansar assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
    {
      id: "2",
      text: "Feel free to ask me about our products, services, or any home decor tips!",
      sender: "bot",
      timestamp: new Date(),
    },
    {
      id: "3",
      text: "You can also type 'help' to see what I can assist you with.",
      sender: "bot",
      timestamp: new Date(),
    },
    {
      id: "4",
      text: "If you need further assistance, contact our support team.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Disable body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! Welcome to Ghar Sansar. I'm here to help you find the perfect home decor items and interior design services. What are you looking for today?";
    }

    if (lowerMessage.includes("product") || lowerMessage.includes("furniture")) {
      return "We have a wide range of products including sofas, dining tables, bedroom furniture, lighting, and decorative items. You can browse our products page or tell me what specific item you're looking for!";
    }

    if (lowerMessage.includes("service") || lowerMessage.includes("design")) {
      return "Our interior design services include consultations, complete room makeovers, and home staging. We also offer 3D visualization and project management. Would you like to request a consultation?";
    }

    if (lowerMessage.includes("shipping") || lowerMessage.includes("delivery")) {
      return "We offer free shipping on orders over ₹8,000. Standard delivery takes 5-7 business days, and we also have express delivery options available.";
    }

    if (lowerMessage.includes("return") || lowerMessage.includes("refund")) {
      return "We have a 30-day return policy for all products in original condition. Returns are free, and refunds are processed within 5-7 business days.";
    }

    if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("help") ||
      lowerMessage.includes("support")
    ) {
      return `
For details, feel free to reach out to us anytime!
📞 Contact Us

📱 +91-8121135980
✉ gharsansarshop@gmail.com
`;
    }

    // Default (Fallback) response if nothing matches
    return `
For details, feel free to reach out to us anytime!
📞 Contact Us

📱 +91-8121135980
✉ gharsansarshop@gmail.com
`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(userMessage.text),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center ${
          isOpen ? "hidden" : "flex"
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
             className="
    fixed bottom-7 left-1 -translate-x-1/2 z-50
    w-[98vw] max-w-[440px] h-[70vh] max-h-[67vh]
    sm:left-auto sm:right-7 sm:translate-x-0
    bg-white shadow-2xl border border-gray-200 rounded-lg flex flex-col
  "
>
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Ghar Sansar Assistant</h3>
                  <p className="text-xs text-blue-100">Online now</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.sender === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.sender === "user"
                        ? "bg-gray-300"
                        : "bg-blue-100"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-line break-words ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
