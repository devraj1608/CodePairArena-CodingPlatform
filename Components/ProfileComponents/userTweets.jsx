"use client";
import React from "react";

function UserTweets({ tweets }) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-blue-500 transition-all duration-300 hover:shadow-[0_0_10px_#00bfff] mx-auto w-full max-h-screen overflow-y-auto">
      <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
        Your Tweets
      </h2>

      {tweets && tweets.length > 0 ? (
        tweets.map((tweet, index) => (
          <div
            key={index}
            className="bg-gray-800 p-5 mb-6 rounded-xl shadow-md border border-blue-400 transition-all duration-300 hover:shadow-[0_0_8px_#00bfff]"
          >
            {/* Date */}
            <div className="flex flex-row-reverse items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">
                {tweet.createdAt
                  ? new Date(tweet.createdAt).toLocaleDateString()
                  : "Unknown date"}
              </span>
            </div>

            {/* Tweet Content */}
            <p className="text-white mb-4 text-lg break-words">{tweet.content}</p>

            {/* Tweet Image */}
            {tweet.image && (
              <img
                src={tweet.image}
                alt="Tweet"
                className="rounded-lg mb-4 max-w-full h-auto object-cover border border-blue-300"
              />
            )}
          </div>
        ))
      ) : (
        <div className="text-gray-400 text-center text-lg">
          No tweets available
        </div>
      )}
    </div>
  );
}

export default UserTweets;