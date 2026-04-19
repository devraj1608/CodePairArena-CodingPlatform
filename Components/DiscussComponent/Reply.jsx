"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../Services/Auth.service";
import { toast } from "react-hot-toast";
import { createTweetService } from "../../Services/Tweet.service";

function Reply({ replyOf = "", onReplySuccess }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTweetCreate = async () => {
    if (!isLoggedIn()) {
      toast.error("Please login to post a message");
      router.push("/login");
      return;
    }

    if (!content.trim() && !file) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const response = await createTweetService(content, replyOf, file);

      if (response?.success || response) {
        toast.success(replyOf === "" ? "Message Posted" : "Reply Sent");
        setContent("");
        setFile(null);
        if (onReplySuccess) onReplySuccess();
        router.refresh();
      } else {
        toast.error("Failed to post message/reply");
      }
    } catch (error) {
      console.error("Error creating tweet:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center gap-2 sm:gap-3 bg-gray-900/95 backdrop-blur-md rounded-3xl shadow-inner border border-gray-700 px-3 sm:px-4 py-2 sm:py-3">
      {/* Attach Image */}
      <label
        className={`flex items-center justify-center p-2 sm:p-3 bg-gray-700 hover:bg-gray-600 rounded-full cursor-pointer transition-all duration-200 ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 sm:h-6 sm:w-6 text-gray-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6"
          />
        </svg>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={loading}
        />
      </label>

      {/* Text Input */}
      <input
        type="text"
        placeholder="Type a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        className="flex-1 bg-gray-800 text-white placeholder-gray-400 rounded-full px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
      />

      {/* Send Button */}
      <button
        onClick={handleTweetCreate}
        disabled={loading}
        className={`flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full px-4 sm:px-5 py-2 sm:py-2.5 shadow-md transition-all duration-300 transform ${
          loading ? "opacity-60 cursor-not-allowed hover:scale-100" : "hover:scale-110"
        }`}
      >
        {loading ? (replyOf === "" ? "Sending..." : "Replying...") : "Send"}
      </button>
    </div>
  );
}

export default Reply;