"use client";

import React from "react";
import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center px-6 py-16 overflow-y-auto relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,153,255,0.15),transparent_70%)] blur-3xl animate-pulse pointer-events-none"></div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-7xl">
        {/* Title */}
        <motion.h1
          className="text-6xl md:text-7xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600  text-center"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          CodePair Arena
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          className="text-2xl md:text-3xl font-semibold text-gray-300 mb-12 tracking-wide text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          A Next-Gen Interactive Coding Platform
        </motion.h2>

        {/* Description */}
        <motion.p
          className="max-w-3xl text-lg md:text-xl text-gray-300 leading-relaxed text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Welcome to{" "}
          <span className="text-blue-400 font-semibold">CodePair Arena</span> —
          the ultimate space for developers, interviewers, and coding enthusiasts.
          This platform redefines the way we learn and collaborate by merging{" "}
          <span className="text-purple-400">problem-solving</span> with real-time{" "}
          <span className="text-pink-400">interaction</span>.
          <br />
          <br />
          Code live with your peers, practice curated coding challenges, host
          interviews, and experience the thrill of solving problems together — all
          inside one powerful environment.
        </motion.p>

        {/* Highlights Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 max-w-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {[
            {
              title: "💻 Real-Time Collaboration",
              desc: "Work together seamlessly — code, debug, and learn in sync with your peers.",
            },
            {
              title: "🧠 Problem Solving Arena",
              desc: "Challenge yourself with curated problems across difficulty levels.",
            },
            {
              title: "🎥 Interactive Interviews",
              desc: "Conduct live coding interviews with built-in video and shared editor.",
            },
            {
              title: "🚀 Multi-Language Support",
              desc: "Run code in multiple languages with a lightning-fast execution engine.",
            },
            {
              title: "🌐 Cross-Device Access",
              desc: "Access your arena from desktop, tablet, or mobile — anytime, anywhere.",
            },
            {
              title: "⚡ Empowering Developers",
              desc: "Join a growing community of learners who code, collaborate, and conquer.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 p-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-semibold text-blue-400 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Text */}
        <motion.p
          className="mt-20 text-gray-500 text-sm text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          © {new Date().getFullYear()} CodePair Arena. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
};

export default AboutPage;