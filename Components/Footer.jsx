"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

const Footer = () => {
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white shadow-lg z-50"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 py-3 sm:py-2">
        {/* Left Section */}
        <div className="text-center sm:text-left mb-2 sm:mb-0">
          <h2 className="text-base sm:text-lg font-semibold">CodePairArena</h2>
          <p className="text-xs sm:text-sm text-gray-400">© {year} All rights reserved.</p>
        </div>

        {/* Right Section */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-4">
          <Link
            href="/about"
            className="text-xs sm:text-sm hover:text-gray-400 transition-colors duration-200"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-xs sm:text-sm hover:text-gray-400 transition-colors duration-200"
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="text-xs sm:text-sm hover:text-gray-400 transition-colors duration-200"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;