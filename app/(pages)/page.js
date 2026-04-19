"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const fontSize = 25;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#00a2ffff");
      gradient.addColorStop(0.5, "#00a2ffff");
      gradient.addColorStop(1, "#3333ffff");

      ctx.fillStyle = gradient;
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, i) => {
        const text = letters[Math.floor(Math.random() * letters.length)];
        if (Math.random() > 0.98) {
          ctx.shadowColor = "rgba(0, 21, 255, 1)";
          ctx.shadowBlur = 20;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillText(text, i * fontSize, y * fontSize);
        const speed = 1;
        drops[i] =
          y * fontSize > canvas.height && Math.random() > 0.975 ? 0 : y + speed;
      });

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-gradient-to-r from-gray-900 via-black to-gray-900">
      {/* Matrix Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70"></canvas>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 lg:px-16 py-20">
        {/* HERO SECTION */}
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl">
          {/* Left Section */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-left max-w-2xl mb-12 lg:mb-0"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="text-white">Welcome to</span>
              <br />
              <span className="text-blue-400">CodePairArena</span>
            </h1>

            <p className="text-gray-300 mt-6 text-lg leading-relaxed max-w-xl">
              Practice curated problems, take contests, and join a community of engineers pushing limits.
              Collaborate in real-time coding rooms and prepare for your next big opportunity.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/problems"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium shadow-lg transition-all duration-300"
              >
                Start Solving
              </Link>

              <Link
                href="/profile"
                className="px-6 py-3 bg-transparent border border-gray-600 hover:border-blue-500 text-gray-300 hover:text-blue-400 rounded-lg text-lg font-medium transition-all duration-300"
              >
                Explore Profile
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <span className="px-4 py-1 bg-gray-800 border border-gray-600 rounded-full text-sm">
                Real-time Editor
              </span>
              <span className="px-4 py-1 bg-purple-800/60 border border-purple-500 rounded-full text-sm">
                Community Driven
              </span>
              <span className="px-4 py-1 bg-yellow-800/60 border border-yellow-500 rounded-full text-sm">
                Contests
              </span>
            </div>
          </motion.div>

          {/* Right Visual Section (Enhanced with Glow + Floating Animation) */}
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-full lg:w-[45%] flex justify-center items-center"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative rounded-3xl border border-gray-700 shadow-[0_0_20px_rgba(0,255,255,0.15)] 
               bg-gradient-to-br from-[#0b0b16] via-[#121224] to-[#1a1a3a] 
               p-6 w-[90%] max-w-md overflow-hidden"
            >
              {/* Subtle glowing background animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-cyan-500/10 to-transparent blur-3xl animate-pulse"></div>

              {/* Main visual block */}
              <div className="relative bg-gradient-to-br from-[#111122] via-[#1a1a3a] to-[#242447] rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-md">
                  CodePairArena
                </h2>
                <p className="text-gray-400 mt-2 text-center text-sm">
                  Advanced Interactive Coding Platform
                </p>

                {/* Fake loading placeholders for animated effect */}
                <div className="mt-6 w-full">
                  <div className="bg-gray-700/50 rounded-xl h-4 w-3/4 mb-3 animate-pulse"></div>
                  <div className="bg-gray-700/50 rounded-xl h-4 w-1/2 mb-3 animate-pulse"></div>
                  <div className="bg-gray-700/50 rounded-xl h-4 w-full mb-3 animate-pulse"></div>
                  <div className="bg-gray-700/50 rounded-xl h-4 w-2/3 animate-pulse"></div>
                </div>
              </div>

              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-cyan-500/20 blur-sm animate-pulse"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Divider Glow */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="mt-20 mb-10 h-[2px] w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 origin-center"
        ></motion.div>

        {/* FEATURE CARDS SECTION */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl"
        >
          {[
            { title: "Problems", link: "/problems" },
            { title: "Discuss", link: "/discuss" },
            { title: "Join Interview", link: "/joinInterview" },
            { title: "Host Interview", link: "/hostInterview" },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, scale: 0.8, y: 40 },
                visible: { opacity: 1, scale: 1, y: 0 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Link
                href={item.link}
                className="group bg-white/10 backdrop-blur-md border border-gray-700 h-40 sm:h-48 flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]"
              >
                <span className="text-xl sm:text-2xl font-semibold text-gray-200 group-hover:text-blue-400">
                  {item.title}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ADDITIONAL INFO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full max-w-7xl mt-24"
        >
          {/* What you'll get */}
          <h2 className="text-3xl font-bold mb-8">What you'll get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            {[
              {
                title: "Real-time Editor",
                desc: "Fast, minimal editor with instant test-run and multi-language support.",
              },
              {
                title: "Detailed Insights",
                desc: "Problem breakdowns, time & space analysis, and community solutions.",
              },
              {
                title: "Contests & Leaderboards",
                desc: "Weekly contests to track progress and climb the global leaderboard.",
              },
              {
                title: "Collaborative Rooms",
                desc: "Pair-program and mock interviews with live audio/video rooms.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/5 border border-gray-700 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Trusted by coders */}
          <h2 className="text-3xl font-bold mb-8">Trusted by coders worldwide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">Start your journey</h3>
              <p className="text-gray-200 text-sm mb-4">
                Create an account and solve your first problem in 60 seconds.
              </p>
              <Link
                href="/register"
                className="bg-white text-indigo-700 hover:bg-gray-200 px-5 py-2 rounded-md font-medium transition"
              >
                Create Account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}