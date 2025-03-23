// src/pages/Messages.tsx
import React, { useEffect, useState } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { RandomMatchPopup } from "@/components/chat/RandomMatchPopup";
import { useNotification } from "@/hooks/useNotification";

export default function Messages() {
  const [showSidebar, setShowSidebar] = useState(true);
  const { requestPermission } = useNotification(); // ✅ Now inside ChatProvider

  useEffect(() => {
    // Request notification permission on mount
    requestPermission();
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-primary-500 text-white rounded-full shadow-lg"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        {showSidebar ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <div className={`${showSidebar ? "block" : "hidden"} md:block flex-shrink-0`}>
        <ChatSidebar onSelectChat={() => setShowSidebar(false)} />
      </div>
      
      {/* Chat Window */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow onOpenSidebar={() => setShowSidebar(true)} />
      </div>
      
      {/* Random Match Popup */}
      <RandomMatchPopup />
    </div>
  );
}