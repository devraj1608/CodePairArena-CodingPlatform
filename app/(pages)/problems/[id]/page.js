"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Split from "react-split";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import CodingBackground from "../../../../Components/CodingBackground";
import Description from "../../../../Components/ProblemsetComponent/Description";
import EditorBox from "../../../../Components/EditorComponent/EditorBox";
import { getProblemService } from "../../../../Services/Problem.service";

export default function ProblemDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const solved = searchParams?.get("solved") === "true";

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProblem = async () => {
      try {
        setLoading(true);
        const data = await getProblemService(id);
        if (data) setProblem(data);
        else toast.error("⚠️ Problem not found");
      } catch (err) {
        console.error("Error fetching problem:", err);
        toast.error("❌ Failed to fetch problem");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  // 🔄 Loading animation
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#0f0f0f] text-gray-400">
        <motion.div
          className="w-16 h-16 border-4 border-t-transparent border-gray-500 rounded-full animate-spin mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.p
          className="text-lg font-light tracking-wider text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Loading Problem...
        </motion.p>
      </div>
    );

  // ❌ Error state
  if (!problem)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 bg-[#0f0f0f]">
        <motion.p
          className="text-xl text-gray-300 font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Problem not found 🫤
        </motion.p>
      </div>
    );

  // ✅ Main layout
  return (
    <div className="relative w-full h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Animated Coding Background */}
      <CodingBackground />

      {/* Gradient Top Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-400 to-purple-500 shadow-lg"
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "100%" }}
        transition={{ duration: 1 }}
      />

      {/* Split Layout */}
      <Split
        className="flex flex-row h-full relative z-10"
        sizes={[40, 60]}
        minSize={300}
        gutterSize={8}
        gutterAlign="center"
        cursor="col-resize"
      >
        {/* LEFT PANEL — Problem Description */}
        <motion.div
          className="overflow-y-auto border-r border-gray-800 p-6 bg-[#121212]/70 backdrop-blur-md shadow-inner hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-500"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Description problem={problem} solved={solved} />
        </motion.div>

        {/* RIGHT PANEL — Code Editor */}
        <motion.div
          className="overflow-y-auto p-4 bg-[#1e1e1e]/90 backdrop-blur-md shadow-lg hover:shadow-[0_0_40px_rgba(147,197,253,0.2)] transition-all duration-500"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <EditorBox problem={problem} solved={solved} />
        </motion.div>
      </Split>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
    </div>
  );
}