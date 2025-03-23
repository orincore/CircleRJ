// src/hooks/useNotification.ts
import { useEffect } from "react";
import { useChatContext } from "@/components/chat/ChatProvider";

export const useNotification = () => {
  const { selectedChat, chatList, setSelectedChat } = useChatContext();

  // Request notification permission
  const requestPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
  };

  // Show a notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, options);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        const chat = chatList.find((c) => c.roomId === options?.data?.roomId);
        if (chat) {
          setSelectedChat(chat);
        }
      };
    }
  };

  // Automatically request permission when the hook is used
  useEffect(() => {
    requestPermission();
  }, []);

  return { requestPermission, showNotification };
};