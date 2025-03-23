// src/components/chat/ChatSidebar.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "./ChatProvider";

export const ChatSidebar: React.FC<{ onSelectChat?: () => void }> = ({ onSelectChat }) => {
  const { chatList, selectedChat, setSelectedChat, startRandomMatch } = useChatContext();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full md:w-80 h-screen bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 sticky top-0 bg-white z-10">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={startRandomMatch} className="w-full mb-4" variant="outline">
          Start Random Chat
        </Button>

        <div className="space-y-2">
          {chatList
            .filter(chat => 
              chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((chat) => (
              <motion.div
                key={chat.roomId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat?.roomId === chat.roomId
                    ? "bg-primary-100"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setSelectedChat(chat);
                  onSelectChat?.();
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <img
                      src={chat.user.avatar || "https://via.placeholder.com/40"}
                      alt={chat.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{chat.user.name}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(chat.lastMessage.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage.content}
                      </p>
                    </div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="ml-2 bg-primary-500 text-white rounded-full px-2 py-1 text-xs">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};