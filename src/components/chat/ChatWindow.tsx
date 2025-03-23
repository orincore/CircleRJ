import React, { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useChatContext } from "./ChatProvider";
import { useNotification } from "@/hooks/useNotification";

export const ChatWindow: React.FC<{ onOpenSidebar?: () => void }> = ({ onOpenSidebar }) => {
  const { user } = useUser();
  const { selectedChat, messages, handleSendMessage } = useChatContext();
  const [inputValue, setInputValue] = React.useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  // Fallback avatar source
  const avatarSource =
    selectedChat?.user.avatar ||
    `https://ui-avatars.com/api/?name=${selectedChat?.user.name}&background=random`;

  // Show notification for new messages
  useEffect(() => {
    if (messages.length > 0 && selectedChat) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender_id !== user?.id) {
        showNotification(`New message from ${selectedChat.user.name}`, {
          body: lastMessage.content,
          icon: avatarSource,
          data: { roomId: selectedChat.roomId },
        });
      }
    }
  }, [messages]);

  // If no chat is selected, show a placeholder
  if (!selectedChat || !selectedChat.user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-4">
          <h3 className="text-lg font-medium text-gray-900">Select a chat to start messaging</h3>
          <p className="mt-1 text-sm text-gray-500">Choose from your conversations or start a random chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-white md:bg-gray-50">
      {/* Header with mobile menu button */}
      <div className="p-4 bg-white border-b border-gray-200 flex items-center">
        <button
          className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-full"
          onClick={onOpenSidebar}
        >
          ←
        </button>
        <img
          src={avatarSource}
          alt={selectedChat.user.name}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedChat.user.name}&background=random`;
          }}
        />
        <div className="ml-3">
          <h3 className="font-medium">{selectedChat.user.name}</h3>
          <p className="text-xs text-gray-500">Online</p>
        </div>
      </div>

      {/* Message container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id || msg.timestamp}
            className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                msg.sender_id === user?.id
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button
            type="submit"
            className="rounded-full w-12 h-12 p-0"
            disabled={!inputValue.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};