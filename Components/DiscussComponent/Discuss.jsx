"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { fetchTweets } from "../../Services/Tweet.service";
import Reply from "./Reply";
import Loading from "../Loading/Loading";

const Discuss = () => {
  const [tweets, setTweets] = useState(null);
  const [replyToTweetId, setReplyToTweetId] = useState(null);
  const [hasNewReply, setHasNewReply] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchTweets();
        // Sort tweets by createdAt ascending: oldest first
        const sortedTweets = (response || []).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setTweets(sortedTweets);
      } catch (error) {
        console.error("Error fetching tweets:", error);
        setTweets([]);
      }
    };
    fetchData();
  }, [hasNewReply]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [tweets]);

  if (tweets === null) return <Loading />;

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gradient-to-b from-transparent to-transparent text-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Chat Area */}
      <div
        className="flex-1 overflow-y-auto px-3 sm:px-6 pt-4 pb-36 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        style={{ maxHeight: "calc(100vh - 80px)" }}
      >
        {tweets.length > 0 ? (
          tweets.map((tweet, index) => {
            const isUser = index % 2 === 0;
            return (
              <motion.div
                key={tweet._id}
                className={`flex flex-col mb-4 ${isUser ? "items-end" : "items-start"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                {/* Message Bubble */}
                <div
                  className={`relative max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 rounded-2xl shadow-md ${
                    isUser
                      ? "bg-green-600/80 rounded-br-none text-white border border-green-500"
                      : "bg-gray-700/80 rounded-bl-none text-gray-100 border border-gray-600"
                  }`}
                >
                  <div className="flex items-center mb-2 space-x-2">
                    {tweet?.owner?.avatar && (
                      <img
                        src={tweet.owner.avatar}
                        alt="avatar"
                        className="w-7 h-7 rounded-full border border-gray-500"
                      />
                    )}
                    <span className="text-sm font-semibold truncate">
                      {tweet.owner?.username || "User"}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed break-words">{tweet.content}</p>

                  {tweet.image && (
                    <motion.img
                      src={tweet.image}
                      alt="Tweet"
                      className="rounded-lg mt-2 w-full object-cover border border-gray-600 shadow-sm"
                      whileHover={{ scale: 1.03 }}
                    />
                  )}

                  <span
                    className={`absolute bottom-1 text-[10px] italic ${
                      isUser ? "right-2 text-gray-200" : "left-2 text-gray-300"
                    }`}
                  >
                    {new Date(tweet.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Replies */}
                {tweet.replys && tweet.replys.length > 0 && (
                  <div
                    className={`flex flex-col mt-2 space-y-2 w-[80%] sm:w-[70%] ${isUser ? "items-end" : "items-start"}`}
                  >
                    {tweet.replys.map((reply) => (
                      <div
                        key={reply._id}
                        className={`p-3 sm:p-4 rounded-2xl shadow-sm ${
                          isUser
                            ? "bg-green-700/60 text-white rounded-br-none border border-green-500"
                            : "bg-gray-800/70 text-gray-200 rounded-bl-none border border-gray-600"
                        }`}
                      >
                        <div className="flex items-center mb-1 space-x-2">
                          {reply?.owner?.avatar && (
                            <img
                              src={reply.owner.avatar}
                              alt="reply avatar"
                              className="w-5 h-5 rounded-full border border-gray-500"
                            />
                          )}
                          <span className="text-xs font-semibold">{reply.owner?.username || "User"}</span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                        <span className="text-[10px] text-gray-300 italic mt-1 block">
                          {new Date(reply.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input Box */}
                {replyToTweetId === tweet._id && (
                  <div className="w-full sm:w-[80%] mt-3">
                    <Reply replyOf={replyToTweetId} onReplySuccess={() => setHasNewReply(!hasNewReply)} />
                  </div>
                )}

                {/* Reply Button */}
                <motion.button
                  onClick={() =>
                    setReplyToTweetId(replyToTweetId === tweet._id ? null : tweet._id)
                  }
                  className={`mt-2 text-xs sm:text-sm px-3 py-1.5 rounded-full font-medium shadow-md transition-all ${
                    isUser
                      ? "bg-green-500 hover:bg-green-400 text-white"
                      : "bg-gray-600 hover:bg-gray-500 text-gray-100"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {replyToTweetId === tweet._id ? "Cancel" : "Reply"}
                </motion.button>
              </motion.div>
            );
          })
        ) : (
          <div className="text-gray-500 text-center text-sm sm:text-lg italic mt-10">
            No messages yet. Start chatting 💬
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Fixed Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 px-3 sm:px-4 mb-20 py-3 rounded-t-3xl shadow-inner z-50">
        <Reply onReplySuccess={() => setHasNewReply(!hasNewReply)} />
      </div>
    </motion.div>
  );
};

export default Discuss;