import React from "react"
import { useEffect, useState } from "react"
import { ChatSidebar } from "../components/chat/ChatSidebar"
import { ChatWindow } from "../components/chat/ChatWindow"
import { RandomMatchPopup } from "../components/chat/RandomMatchPopup"
import { useNotification } from "../hooks/useNotification"
import { Menu, X } from "lucide-react"

export default function Messages() {
  const [showSidebar, setShowSidebar] = useState(true)
  const { requestPermission } = useNotification()

  useEffect(() => {
    // Request notification permission on mount
    requestPermission()

    // Handle responsive layout
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true)
      } else {
        setShowSidebar(false)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="h-[calc(100vh-8rem)] flex overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
  className="md:hidden fixed top-3 left-4 z-50 p-3 bg-primary-500 text-white rounded-full shadow-lg"
  onClick={() => setShowSidebar(!showSidebar)}
>
  {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
</button>

      {/* Sidebar */}
  <div
    className={`${
      showSidebar ? "translate-x-0" : "-translate-x-full"
    } md:translate-x-0 md:block w-full md:w-80 flex-shrink-0 z-40 md:relative fixed inset-0 transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900`}
  >
    <ChatSidebar onSelectChat={() => setShowSidebar(false)} />
  </div>

      {/* Chat Window */}
  <div className="flex-1 flex flex-col overflow-hidden relative">
    <ChatWindow onOpenSidebar={() => setShowSidebar(true)} />
  </div>

  <RandomMatchPopup />
</div>
  )
}

