"use client";

import React from "react";
import { motion } from "framer-motion";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-6 py-16 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)] blur-3xl animate-pulse pointer-events-none"></div>

      <motion.h1
        className="text-6xl md:text-7xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Get in Touch 💬
      </motion.h1>

      <motion.p
        className="text-gray-300 text-lg md:text-xl text-center max-w-2xl mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
      >
        Have a question, idea, or collaboration in mind?  
        Drop a message — let’s build something amazing together at{" "}
        <span className="text-blue-400 font-semibold">CodePair Arena</span>.
      </motion.p>

      {/* Contact Form */}
      <motion.form
        className="w-full max-w-lg bg-gray-800/60 backdrop-blur-md p-8 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.6)] border border-gray-700 space-y-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        {/* Name */}
        <div className="flex flex-col">
          <label className="text-gray-300 font-medium mb-2">Your Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="p-3 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-gray-300 font-medium mb-2">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="p-3 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col">
          <label className="text-gray-300 font-medium mb-2">Message</label>
          <textarea
            rows="5"
            placeholder="Write your message..."
            className="p-3 rounded-md bg-gray-900 border border-gray-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          ></textarea>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 mt-4 text-lg font-semibold rounded-md bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 hover:from-blue-500 hover:to-blue-500 transition-all duration-300 "
        >
          Send Message 
        </motion.button>
      </motion.form>

      {/* Footer */}
      <motion.p
        className="mt-12 text-gray-500 text-sm text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        © {new Date().getFullYear()} CodePair Arena. All rights reserved.
      </motion.p>
    </div>
  );
};

export default ContactPage;