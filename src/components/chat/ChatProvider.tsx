// src/components/chat/ChatProvider.tsx
import  React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useUser } from "@clerk/clerk-react"
import { supabase } from "../../lib/SupabaseClient"

// Utility function to generate consistent room IDs
const getRoomId = (user1: string, user2: string): string => {
  return [user1, user2].sort().join("-")
}

export interface Message {
  id?: string
  sender_id: string
  recipient_id: string
  content: string
  timestamp: string
}

export interface ChatUser {
  id: string
  name: string
  avatar?: string
}

export interface Chat {
  roomId: string
  partnerId: string
  user: ChatUser
  messages: Message[]
  lastMessage: Message
  unreadCount: number
}

type MatchStatus = "waiting" | "pending" | "connected" | "rejected" | null

interface ChatContextValue {
  socket: Socket | null
  chatList: Chat[]
  setChatList: React.Dispatch<React.SetStateAction<Chat[]>>
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  selectedChat: Chat | null
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>
  isRandomMatching: boolean
  setIsRandomMatching: React.Dispatch<React.SetStateAction<boolean>>
  matchingStatus: string
  setMatchingStatus: React.Dispatch<React.SetStateAction<string>>
  matchedUser: ChatUser | null
  setMatchedUser: React.Dispatch<React.SetStateAction<ChatUser | null>>
  matchStatus: MatchStatus
  setMatchStatus: React.Dispatch<React.SetStateAction<MatchStatus>>
  accepted: boolean
  setAccepted: React.Dispatch<React.SetStateAction<boolean>>
  matchRoomId: string | null
  setMatchRoomId: React.Dispatch<React.SetStateAction<string | null>>
  handleSendMessage: (text: string) => void
  fetchExistingChats: () => void
  startRandomMatch: () => void
  acceptRandomMatch: () => void
  rejectRandomMatch: () => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) throw new Error("useChatContext must be used within a ChatProvider")
  return context
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [chatList, setChatList] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [isRandomMatching, setIsRandomMatching] = useState(false)
  const [matchingStatus, setMatchingStatus] = useState("Matching you with someone...")
  const [matchedUser, setMatchedUser] = useState<ChatUser | null>(null)
  const [matchStatus, setMatchStatus] = useState<MatchStatus>(null)
  const [accepted, setAccepted] = useState(false)
  const [matchRoomId, setMatchRoomId] = useState<string | null>(null)
  const socketServerUrl = "https://circlebackendv1.onrender.com"

  useEffect(() => {
    if (!isLoaded || !user?.id) return

    const newSocket = io(socketServerUrl)
    setSocket(newSocket)

    newSocket.on("connect", () => newSocket.emit("join", user.id))

    newSocket.on("privateMessage", (data: any) => {
      if (!user?.id || !data.senderId || !data.message) {
        console.error("Invalid message received:", data)
        return
      }

      const transformedMessage: Message = {
        sender_id: data.senderId,
        recipient_id: user.id,
        content: data.message,
        timestamp: new Date().toISOString(),
      }

      const partnerId = transformedMessage.sender_id
      const roomId = getRoomId(user.id, partnerId)

      setChatList((prev) => {
        const existingChat = prev.find((chat) => chat.roomId === roomId)
        if (existingChat) {
          return prev.map((chat) =>
            chat.roomId === roomId
              ? {
                  ...chat,
                  messages: [...chat.messages, transformedMessage],
                  lastMessage: transformedMessage,
                  unreadCount: selectedChat?.roomId === roomId ? 0 : chat.unreadCount + 1,
                }
              : chat,
          )
        }

        const newChat: Chat = {
          roomId,
          partnerId,
          user: {
            id: partnerId,
            name: `User ${partnerId.slice(-4)}`,
            avatar: `https://ui-avatars.com/api/?name=${partnerId.slice(-4)}&background=random`,
          },
          messages: [transformedMessage],
          lastMessage: transformedMessage,
          unreadCount: 1,
        }
        return [newChat, ...prev]
      })

      if (selectedChat?.roomId === roomId) {
        setMessages((prev) => [...prev, transformedMessage])
      }
    })

    newSocket.on("randomMatchStatus", (data: any) => {
      setMatchStatus(data.status)
      if (data.roomId) setMatchRoomId(data.roomId)
      if (data.matchedUser) setMatchedUser(data.matchedUser)
      if (data.status === "rejected") setAccepted(false)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [isLoaded, user?.id, selectedChat])

  useEffect(() => {
    if (matchStatus === "connected" && matchedUser && user?.id) {
      const roomId = getRoomId(user.id, matchedUser.id)

      const newChat: Chat = {
        roomId,
        partnerId: matchedUser.id,
        user: {
          id: matchedUser.id,
          name: matchedUser.name || `User ${matchedUser.id.slice(-4)}`,
          avatar:
            matchedUser.avatar ||
            `https://ui-avatars.com/api/?name=${matchedUser.name || matchedUser.id}&background=random`,
        },
        messages: [
          {
            sender_id: "system",
            recipient_id: user.id,
            content: "You are now connected!",
            timestamp: new Date().toISOString(),
          },
        ],
        lastMessage: {
          sender_id: "system",
          recipient_id: user.id,
          content: "You are now connected!",
          timestamp: new Date().toISOString(),
        },
        unreadCount: 1,
      }

      setChatList((prev) => {
        const exists = prev.some((chat) => chat.roomId === roomId)
        return exists ? prev : [newChat, ...prev]
      })

      setSelectedChat(newChat)
      setMessages(newChat.messages)
      setIsRandomMatching(false)
      setMatchRoomId(null)
    }
  }, [matchStatus, matchedUser, user?.id])

  async function fetchExistingChats() {
    if (!user?.id) return
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("timestamp", { ascending: true })

      if (error || !data) return

      const chatMap: Record<string, Message[]> = {}
      data.forEach((msg: Message) => {
        if (!msg.sender_id || !msg.recipient_id) {
          console.warn("Skipping invalid message:", msg)
          return
        }

        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
        const roomId = getRoomId(user.id, partnerId)
        chatMap[roomId] = [...(chatMap[roomId] || []), msg]
      })

      const chats = Object.entries(chatMap).map(([roomId, msgs]) => {
        const lastMsg = msgs[msgs.length - 1]
        const partnerId = lastMsg.sender_id === user.id ? lastMsg.recipient_id : lastMsg.sender_id

        return {
          roomId,
          partnerId,
          user: {
            id: partnerId,
            name: `User ${partnerId.slice(-4)}`,
            avatar: `https://ui-avatars.com/api/?name=${partnerId.slice(-4)}&background=random`,
          },
          messages: msgs,
          lastMessage: lastMsg,
          unreadCount: 0,
        }
      })

      chats.sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime())

      setChatList(chats)
      if (!selectedChat && chats.length) {
        setSelectedChat(chats[0])
        setMessages(chats[0].messages)
      }
    } catch (err) {
      console.error("Error fetching chats:", err)
    }
  }

  useEffect(() => {
    fetchExistingChats()
  }, [user?.id])

  function handleSendMessage(text: string) {
    if (!socket || !selectedChat || !user?.id) return
    const msg: Message = {
      sender_id: user.id,
      recipient_id: selectedChat.partnerId,
      content: text,
      timestamp: new Date().toISOString(),
    }

    socket.emit("privateMessage", {
      recipientId: selectedChat.partnerId,
      message: text,
      roomId: selectedChat.roomId,
    })

    setChatList((prev) =>
      prev.map((chat) =>
        chat.roomId === selectedChat.roomId
          ? {
              ...chat,
              messages: [...chat.messages, msg],
              lastMessage: msg,
            }
          : chat,
      ),
    )
    setMessages((prev) => [...prev, msg])
  }

  function startRandomMatch() {
    setIsRandomMatching(true)
    setMatchedUser(null)
    setMatchStatus(null)
    setAccepted(false)
    setMatchRoomId(null)
    setMatchingStatus("Matching you with someone who shares your interests...")
    socket?.emit("findRandomMatch")
  }

  function acceptRandomMatch() {
    if (matchedUser && socket && matchRoomId && !accepted) {
      socket.emit("randomMatchAccept", { roomId: matchRoomId })
      setAccepted(true)
      setMatchingStatus("Please wait till the other user accepts your request.")
    }
  }

  function rejectRandomMatch() {
    if (socket && matchedUser && matchRoomId) {
      socket.emit("randomMatchReject", { roomId: matchRoomId })
    }
    setMatchedUser(null)
    setAccepted(false)
    startRandomMatch()
  }

  const value = {
    socket,
    chatList,
    setChatList,
    messages,
    setMessages,
    selectedChat,
    setSelectedChat,
    isRandomMatching,
    setIsRandomMatching,
    matchingStatus,
    setMatchingStatus,
    matchedUser,
    setMatchedUser,
    matchStatus,
    setMatchStatus,
    accepted,
    setAccepted,
    matchRoomId,
    setMatchRoomId,
    handleSendMessage,
    fetchExistingChats,
    startRandomMatch,
    acceptRandomMatch,
    rejectRandomMatch,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

