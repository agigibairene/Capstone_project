/* eslint-disable react-hooks/exhaustive-deps */
import { MessageCircle, ChevronDown, Bot, Plus, Edit3, Trash2, Menu, X } from "lucide-react";
import BotForm from "./BotForm";
import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { keys } from "../Utils/constants";

export interface Messages {
  role: "user" | "model";
  text: string;
  isError?: boolean;
}

interface Chat {
  id: string;
  title: string;
  messages: Messages[];
  createdAt: Date;
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${keys}`;

export default function ChatBot(){
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const chatHistory = currentChat?.messages || [];

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [chatHistory, currentChatId]);

  // Close sidebar when chat is selected on mobile
  useEffect(() => {
    if (currentChatId && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [currentChatId]);

  const generateChatTitle = (messages: Messages[]): string => {
    const firstUserMessage = messages.find((msg) => msg.role === "user");
    if (firstUserMessage) {
      const words = firstUserMessage.text.split(" ").slice(0, 4);
      return words.join(" ") + (firstUserMessage.text.split(" ").length > 4 ? "..." : "");
    }
    return "New Chat";
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    // Close sidebar on mobile after creating new chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  };

  const setChatHistory = (updater: React.SetStateAction<Messages[]>) => {
    if (!currentChatId) return;

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          const newMessages = typeof updater === "function" ? updater(chat.messages) : updater;
          return {
            ...chat,
            messages: newMessages,
            title:
              newMessages.length > 0 && chat.title === "New Chat"
                ? generateChatTitle(newMessages)
                : chat.title,
          };
        }
        return chat;
      })
    );
  };

  async function generateBotResponse(history: Messages[]): Promise<void> {
    function updateHistory(text: string, isError: boolean = false): void {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Typing..."),
        { role: "model", text, isError },
      ]);
    }

    const formattedHistory = history.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents: formattedHistory }),
    };

    try {
      if (!keys) {
        throw new Error("API key is not configured. Please API_KEY.");
      }

      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Something went wrong!");
      }

      const apiResponse = data.candidates[0].content.parts[0].text;
      updateHistory(apiResponse);
    } catch (e) {
      console.error("API Error:", e);
      updateHistory("Sorry, I encountered an error. Please try again.", true);
    }
  }

  const startEditingTitle = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const saveEditedTitle = () => {
    if (editingChatId && editTitle.trim()) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === editingChatId ? { ...chat, title: editTitle.trim() } : chat
        )
      );
    }
    setEditingChatId(null);
    setEditTitle("");
  };

  return (
    <div className="flex h-screen w-full mx-auto bg-white/20 backdrop-blur-sm border-r rounded-none md:rounded-lg md:h-[75vh] md:w-[90%] border-white/30 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative top-0 left-0 h-full md:h-auto
        w-80 sm:w-64 md:w-72 lg:w-80
        bg-white/20 backdrop-blur-sm border-r 
        rounded-none md:rounded-tl-lg md:rounded-bl-lg 
        border-white/30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        z-50 md:z-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 bg-bgColor text-limeTxt rounded-lg hover:bg-teal-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                currentChatId === chat.id
                  ? "bg-teal-50 border border-teal-200"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setCurrentChatId(chat.id)}
            >
              <MessageCircle
                size={16}
                className={currentChatId === chat.id ? "text-bgColor" : "text-gray-400"}
              />
              <div className="flex-1 min-w-0">
                {editingChatId === chat.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={saveEditedTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEditedTitle();
                      if (e.key === "Escape") {
                        setEditingChatId(null);
                        setEditTitle("");
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-teal-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    autoFocus
                  />
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">{chat.title}</p>
                    <p className="text-xs text-gray-900">{chat.messages.length} messages</p>
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingTitle(chat.id, chat.title);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer rounded"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 cursor-pointer rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentChat ? (
          <>
            <div className="flex items-center justify-between p-4 backdrop-blur-sm border-b border-white/30">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu size={20} />
                </button>
                
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-bgColor flex items-center justify-center">
                  <Bot size={16} className="text-white md:w-5 md:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 truncate">{currentChat.title}</h2>
                  <p className="text-xs md:text-sm text-limeTxt">AI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full cursor-pointer hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
              >
                <ChevronDown
                  size={18}
                  className={`transform transition-transform duration-200 ${
                    isMinimized ? "rotate-180" : ""
                  } text-gray-600 md:w-5 md:h-5`}
                />
              </button>
            </div>

            {!isMinimized && (
              <div className="flex-1 flex flex-col relative overflow-hidden">
                <div
                  ref={chatBodyRef}
                  className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 space-y-4"
                >
                  {chatHistory.length === 0 && (
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-bgColor flex items-center justify-center flex-shrink-0 self-end mb-0.5">
                        <Bot size={16} className="text-white md:w-[18px] md:h-[18px]" />
                      </div>
                      <div className="px-3 py-2 md:px-4 md:py-3 max-w-[85%] md:max-w-[75%] bg-purple-50 text-gray-800 rounded-2xl rounded-bl-sm text-sm break-words whitespace-pre-line">
                        Hello there! How can I help you today?
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 min-w-0 w-full">
                    {chatHistory.map((chat, index) => (
                      <Message key={`${currentChatId}-${index}`} chat={chat} />
                    ))}
                  </div>
                </div>

                <div className="p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-none md:rounded-tr-lg md:rounded-br-lg border-white/30 border-t">
                  <BotForm
                    setChatHistory={setChatHistory}
                    generateBotResponse={generateBotResponse}
                    chatHistory={chatHistory}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center rounded-none md:rounded-tr-lg md:rounded-br-lg bg-gray-50 p-4">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={24} className="text-bgColor md:w-8 md:h-8" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No chat selected</h3>
              <p className="text-sm text-gray-500 mb-4">
                Choose a chat from the sidebar or create a new one
              </p>
              <div className="space-y-2">
                <button
                  onClick={createNewChat}
                  className="w-full px-4 cursor-pointer py-2 bg-bgColor text-white rounded-lg hover:bg-teal-900 transition-colors duration-200"
                >
                  Start New Chat
                </button>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-full md:hidden px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  View Chats
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}