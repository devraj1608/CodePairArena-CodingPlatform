"use client";

import React from "react";
import { motion } from "framer-motion";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center px-6 py-16">
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-center mb-8
          bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🔒 Privacy Policy
      </motion.h1>

      <motion.div
        className="max-w-4xl bg-gray-800/60 p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p className="text-gray-300 mb-4 leading-relaxed">
          Welcome to <span className="font-semibold text-white">CodePairArena</span> — 
          an interactive coding platform designed to enhance your coding and interview experience. 
          This Privacy Policy explains how we collect, use, and protect your data when you use our platform.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">1. Information We Collect</h2>
        <p className="text-gray-400 mb-4">
          We collect minimal personal information such as your name, email, and coding activity data.
          We also use cookies to improve platform performance and user experience.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">2. How We Use Your Data</h2>
        <p className="text-gray-400 mb-4">
          The data we collect helps us:
        </p>
        <ul className="list-disc list-inside text-gray-400 space-y-2">
          <li>Enhance your problem-solving and collaboration experience.</li>
          <li>Provide personalized recommendations and performance tracking.</li>
          <li>Improve our features and overall user interface.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">3. Data Protection</h2>
        <p className="text-gray-400 mb-4">
          We use industry-standard encryption and secure storage mechanisms to ensure 
          that your personal and coding data remain safe from unauthorized access.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">4. Third-Party Services</h2>
        <p className="text-gray-400 mb-4">
          We may use third-party tools (like analytics or authentication providers) 
          that collect usage data to improve our services. These services comply 
          with modern data protection standards.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">5. Your Rights</h2>
        <p className="text-gray-400 mb-4">
          You have the right to access, modify, or delete your data. 
          You can contact us anytime through our support section for assistance.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">6. Updates to this Policy</h2>
        <p className="text-gray-400 mb-4">
          This Privacy Policy may be updated occasionally to reflect platform improvements or legal changes.
          Please revisit this page to stay informed.
        </p>

        <p className="text-center text-gray-500 mt-10 italic">
          © {new Date().getFullYear()} CodePairArena. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default PrivacyPage;