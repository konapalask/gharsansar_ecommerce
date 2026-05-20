import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MessageSquare, Send, User, Bot, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "admin";
  timestamp: string;
}

interface ChatSession {
  sessionId: string;
  userName: string;
  userEmail: string;
  messages: Message[];
  updatedAt: string;
}

const ChatsAdmin: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await axios.get("http://localhost:5001/api/chats");
      
      // Filter sessions that have >= 5 user messages
      const filtered = res.data.filter((session: ChatSession) => {
        const userMsgsCount = session.messages.filter(m => m.sender === "user").length;
        return userMsgsCount >= 5;
      });
      
      setSessions(filtered);
      
      // Select first session by default if none selected
      if (filtered.length > 0 && !selectedSessionId) {
        setSelectedSessionId(filtered[0].sessionId);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      toast.error("Failed to load customer chats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    // Poll for new messages/chats every 5 seconds
    const interval = setInterval(() => fetchChats(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const activeSession = sessions.find(s => s.sessionId === selectedSessionId);

  // Scroll active chat panel to bottom when selection or messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSessionId, activeSession?.messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSessionId || !activeSession) return;

    const newAdminMessage: Message = {
      id: `admin_${Date.now()}`,
      text: replyText.trim(),
      sender: "admin",
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...activeSession.messages, newAdminMessage];
    
    // Optimistic UI Update
    setSessions(prev => 
      prev.map(s => 
        s.sessionId === selectedSessionId 
          ? { ...s, messages: updatedMessages, updatedAt: new Date().toISOString() }
          : s
      )
    );
    setReplyText("");

    try {
      await axios.post("http://localhost:5001/api/chats", {
        sessionId: activeSession.sessionId,
        userName: activeSession.userName,
        userEmail: activeSession.userEmail,
        messages: updatedMessages
      });
      toast.success("Reply sent!");
    } catch (err) {
      console.error("Error sending chat reply:", err);
      toast.error("Failed to deliver reply to customer.");
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchChats(true);
    setRefreshing(false);
    toast.success("Chats refreshed!");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden h-[calc(100vh-12rem)] flex flex-col md:flex-row">
      {/* Sidebar List of Chats */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <h2 className="font-extrabold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>Customer Chats</span>
          </h2>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className={`p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition ${refreshing ? 'animate-spin' : ''}`}
            title="Refresh chats"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-xs text-gray-400 font-medium">Loading conversations...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <span className="text-3xl">💬</span>
              <h4 className="font-bold text-gray-700 text-sm">No Active Chats</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Chats will appear here once a customer sends 5 or more messages.
              </p>
            </div>
          ) : (
            sessions.map(session => {
              const userMsgs = session.messages.filter(m => m.sender === "user");
              const lastMsg = session.messages[session.messages.length - 1];
              const isSelected = session.sessionId === selectedSessionId;

              return (
                <button
                  key={session.sessionId}
                  onClick={() => setSelectedSessionId(session.sessionId)}
                  className={`w-full p-4 rounded-xl text-left transition flex flex-col gap-1.5 border ${
                    isSelected 
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" 
                      : "bg-white hover:bg-gray-100 border-gray-100 text-gray-700 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold truncate text-sm">
                      {session.userName}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-600"
                    }`}>
                      {userMsgs.length} user msgs
                    </span>
                  </div>
                  <span className={`text-xs truncate block ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                    {session.userEmail}
                  </span>
                  {lastMsg && (
                    <p className={`text-xs truncate mt-1 ${isSelected ? 'text-white/95 font-medium' : 'text-gray-500'}`}>
                      {lastMsg.sender === "admin" ? "You: " : lastMsg.sender === "bot" ? "Bot: " : ""}
                      {lastMsg.text}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat window panel */}
      <div className="flex-1 flex flex-col bg-white">
        {activeSession ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm md:text-base">
                    Chatting with {activeSession.userName}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {activeSession.userEmail}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <ShieldCheck size={14} />
                <span>Verified Active Session</span>
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {activeSession.messages.map((message) => {
                const isAdmin = message.sender === "admin";
                const isBot = message.sender === "bot";
                const isUser = message.sender === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${
                      isAdmin ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isAdmin
                          ? "bg-emerald-100 text-emerald-600"
                          : isBot
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isAdmin ? (
                        <ShieldCheck size={15} />
                      ) : isBot ? (
                        <Bot size={15} />
                      ) : (
                        <User size={15} />
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-1 max-w-[75%]">
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line shadow-sm ${
                          isAdmin
                            ? "bg-emerald-600 text-white rounded-tr-none"
                            : isBot
                            ? "bg-gray-100 text-gray-600 rounded-tl-none font-medium"
                            : "bg-blue-600 text-white rounded-tl-none"
                        }`}
                      >
                        {message.text}
                      </div>
                      <span className={`text-[10px] text-gray-400 font-medium flex items-center gap-1 px-1 ${
                        isAdmin ? 'self-end' : ''
                      }`}>
                        <Clock size={10} />
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Reply Input Form */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write a reply to ${activeSession.userName}...`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-bold"
                >
                  <span>Send</span>
                  <Send size={14} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/20">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-4 animate-bounce" />
            <h3 className="font-extrabold text-gray-800 text-lg">Select a Conversation</h3>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed mt-1">
              Choose a customer chat session from the list on the left to read and respond in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsAdmin;
