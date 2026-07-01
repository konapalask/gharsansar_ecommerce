import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "admin";
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isProductDetailPage = location.pathname.startsWith("/product/");
  const API_BASE = import.meta.env.VITE_AWS_API_URL || "https://backend.gharsansar.store/api";
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

  // Persistent session ID
  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem("chat_session_id");
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("chat_session_id", id);
    }
    return id;
  });

  // Sync to backend if the user sends 5 or more messages
  const syncChatWithBackend = async (currentMessages: Message[]) => {
    const userMsgsCount = currentMessages.filter((m) => m.sender === "user").length;
    if (userMsgsCount >= 5) {
      try {
        await axios.post(`${API_BASE}/chats`, {
          sessionId,
          userName: user?.name || (isAuthenticated ? user?.email.split("@")[0] : "Guest"),
          userEmail: user?.email || "guest@example.com",
          messages: currentMessages.map((m) => ({
            id: m.id,
            text: m.text,
            sender: m.sender,
            timestamp: m.timestamp.toISOString()
          }))
        });
      } catch (err) {
        console.error("Failed to sync chat session with backend:", err);
      }
    }
  };

  // Poll for admin replies if sync is active (> 5 user messages)
  useEffect(() => {
    const userMsgsCount = messages.filter((m) => m.sender === "user").length;
    if (userMsgsCount < 5) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/chats`);
        const activeChat = res.data.find((c: any) => c.sessionId === sessionId);
        if (activeChat && activeChat.messages) {
          const fetchedMessages = activeChat.messages.map((m: any) => ({
            id: m.id,
            text: m.text,
            sender: m.sender,
            timestamp: new Date(m.timestamp)
          }));
          
          // Only update if messages length has changed (e.g. admin replied)
          if (fetchedMessages.length > messages.length) {
            setMessages(fetchedMessages);
          }
        }
      } catch (err) {
        console.error("Error polling for admin replies:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [messages, sessionId]);

  // Sync messages whenever they change
  useEffect(() => {
    syncChatWithBackend(messages);
  }, [messages]);

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

    if (lowerMessage.includes("product") || lowerMessage.includes("furniture") || lowerMessage.includes("cookware") || lowerMessage.includes("steel")) {
      return "We have a wide range of products including sofas, dining tables, kitchen cookware (such as Sonu Steel cookware products), lighting, and decorative items. You can browse our products page or tell me what specific item you're looking for!";
    }

    if (lowerMessage.includes("service") || lowerMessage.includes("design")) {
      return "Our interior design services include consultations, complete room makeovers, and home staging. We also offer 3D visualization and project management. Would you like to request a consultation?";
    }

    if (lowerMessage.includes("shipping") || lowerMessage.includes("delivery")) {
      return "We charge a standard shipping fee of ₹99 for serviceable pincodes and ₹149 for other regions. Standard delivery takes 2-3 business days via Delhivery.";
    }

    if (lowerMessage.includes("return") || lowerMessage.includes("refund")) {
      return "Showroom items and bespoke interior creations are non-refundable. For other stock items, we have a 10-day return policy in original packaging.";
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

    const newMsgs = [...messages, userMessage];
    setMessages(newMsgs);
    setInputValue("");
    
    const userMsgsCount = newMsgs.filter((m) => m.sender === "user").length;

    if (userMsgsCount < 5) {
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
    } else if (userMsgsCount === 5) {
      setIsTyping(true);
      setTimeout(() => {
        const transitionResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I am connecting you to our human support team. An agent will reply to you shortly.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, transitionResponse]);
        setIsTyping(false);
      }, 1500);
    }
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
        className={`fixed right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center ${
          isProductDetailPage ? "bottom-24" : "bottom-6"
        } ${
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
                        : message.sender === "admin"
                        ? "bg-emerald-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4 text-gray-600" />
                    ) : message.sender === "admin" ? (
                      <Bot className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-line break-words ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : message.sender === "admin"
                        ? "bg-emerald-600 text-white"
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
              {!isAuthenticated ? (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 font-medium mb-3">Please sign in to chat with our support team.</p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/login');
                    }}
                    className="w-full bg-blue-600 text-white px-3 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Sign In Now
                  </button>
                </div>
              ) : (
                <>
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
                  <div className="text-[10px] text-gray-400 text-center mt-2 font-medium">
                    {messages.filter(m => m.sender === 'user').length < 5 ? (
                      <span>Send {5 - messages.filter(m => m.sender === 'user').length} more user messages to alert our design team!</span>
                    ) : (
                      <span className="text-emerald-600 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        Live sync active. Admin team notified.
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
