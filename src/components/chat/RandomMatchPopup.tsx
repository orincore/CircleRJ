import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useChatContext } from "./ChatProvider";
import { maskName } from "./utils"; // Or inline

export const RandomMatchPopup: React.FC = () => {
  const {
    isRandomMatching,
    matchingStatus,
    matchedUser,
    matchStatus,
    acceptRandomMatch,
    rejectRandomMatch,
    setIsRandomMatching,
    setMessages,
    setChatList,
    setSelectedChat,
  } = useChatContext();

  function closePopup() {
    setIsRandomMatching(false);
  }

  if (!isRandomMatching) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg p-8 w-full h-full max-w-md mx-4 text-center flex flex-col justify-center relative"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={closePopup}
        >
          X
        </button>

        {!matchedUser ? (
          <>
            <h2 className="text-3xl font-bold mb-4">Matching...</h2>
            <p className="text-lg text-gray-600 mb-6">{matchingStatus}</p>
            <p className="text-sm text-gray-500">
              Please wait while we find a match for you.
            </p>
          </>
        ) : matchStatus === "pending" || matchStatus === "waiting" ? (
          <>
            <h2 className="text-3xl font-bold mb-4">Match Found!</h2>
            <p className="text-xl text-gray-600 mb-2">
              {maskName(matchedUser.name)}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {matchedUser.age || "-"} • {matchedUser.location || "-"} • {matchedUser.gender || "-"}
            </p>
            <p className="text-md text-gray-600 mb-4">
              Please wait till the other user accepts your request.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={rejectRandomMatch}>
                Reject
              </Button>
              <Button onClick={acceptRandomMatch}>
                Accept
              </Button>
            </div>
          </>
        ) : matchStatus === "connected" ? (
          <>
            <h2 className="text-3xl font-bold mb-4">Hurrey!!! You are now connected.</h2>
            <Button
              onClick={() => {
                setSelectedChat(matchedUser);
                setIsRandomMatching(false);
                setMessages([
                  {
                    senderId: "system",
                    text: "Hurrey!!! You are now connected.",
                    time: new Date().toLocaleTimeString(),
                  },
                ]);
                setChatList((prev) => {
                  if (!prev.find((chat) => chat.id === matchedUser.id)) {
                    return [
                      ...prev,
                      {
                        id: matchedUser.id,
                        user: matchedUser,
                        lastMessage: {
                          text: "Hurrey!!! You are now connected.",
                          time: new Date().toLocaleTimeString(),
                          senderId: "system",
                        },
                      },
                    ];
                  }
                  return prev;
                });
              }}
            >
              Proceed to Chat
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4">Matching...</h2>
            <p className="text-lg text-gray-600 mb-6">{matchingStatus}</p>
          </>
        )}
      </motion.div>
    </div>
  );
};
