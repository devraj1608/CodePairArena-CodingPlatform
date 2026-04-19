"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Loading from "../Loading/Loading";
import { getAllProblemsService } from "../../Services/Problem.service";
import { getSolvedProblemService } from "../../Services/Submissions.service";

const difficultyColors = {
  easy: "bg-green-500 text-white",
  medium: "bg-yellow-500 text-white",
  hard: "bg-red-600 text-white",
};

const AllProblems = ({ user }) => {
  const [problems, setProblems] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching problems and solved status...");
        const problemsData = await getAllProblemsService();
        const solvedData = await getSolvedProblemService();

        console.log("✅ Problems fetched:", problemsData?.length);
        console.log("✅ Solved data:", solvedData);

        if (problemsData) setProblems(problemsData);
        if (solvedData) {
          setSolvedProblems(solvedData);
        } else {
          // If solvedData is null, set empty Set
          console.warn("⚠️ No solved problems data, using empty set");
          setSolvedProblems(new Set());
        }
      } catch (err) {
        console.error("❌ Error fetching problems:", err);
        setSolvedProblems(new Set());
      }
    };
    fetchData();
  }, []);

  if (!problems) return <Loading />;

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row text-white p-5 md:p-10 gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Problems Table */}
      <motion.div
        className="w-full md:w-2/3 m-0 md:m-14"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-blue-400 mb-8 md:mb-12 underline underline-offset-8 drop-shadow-lg text-center md:text-left"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          whileHover={{ scale: 1.05, color: "#00bfff" }}
        >
          Problems
        </motion.h1>

        <motion.div
          className="bg-gray-900/20 shadow-2xl rounded-3xl overflow-x-auto md:overflow-hidden backdrop-blur-lg border border-gray-700/30"
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-blue-700/30 text-sm font-bold text-gray-100 tracking-wider text-center backdrop-blur-sm">
              <tr>
                <th className="text-left px-4 py-3 md:px-6 md:py-5">TITLE</th>
                <th className="px-4 py-3 md:px-6 md:py-5">DIFFICULTY</th>
                <th className="px-4 py-3 md:px-6 md:py-5">SOLVED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {problems.map((problem, index) => (
                <motion.tr
                  key={problem._id}
                  onClick={() =>
                    router.push(
                      `/problems/${problem._id}?solved=${
                        solvedProblems.has(problem._id) ? "true" : "false"
                      }`
                    )
                  }
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    scale: 1.03,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 15px rgba(0,191,255,0.2)",
                  }}
                  className="transition-all duration-300 cursor-pointer"
                >
                  <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-md font-medium text-gray-100">
                    <span className="text-gray-300 font-bold mr-2">
                      {index + 1}.
                    </span>{" "}
                    <motion.span
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      {problem.title}
                    </motion.span>
                  </td>
                  <td
                    className={`px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-md text-center font-semibold rounded-lg ${
                      difficultyColors[problem.difficulty]
                    } shadow-md`}
                  >
                    <motion.span
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {problem.difficulty.toUpperCase()}
                    </motion.span>
                  </td>
                  <td className="px-4 py-2 md:px-6 md:py-2 whitespace-nowrap flex justify-center">
                    {solvedProblems.has(problem._id) && (
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 md:h-9 w-8 md:w-9 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut",
                        }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 
                          4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 
                          0 001.414 0l7-7a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        className="hidden md:flex w-1/3 h-1/2 p-5 rounded-2xl shadow-lg flex-col items-center
                      bg-gray-900/50 border-2 border-blue-500/50 
                      backdrop-blur-md transition-all duration-500
                      hover:shadow-[0_0_35px_#00bfff] hover:border-blue-400/80"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        whileHover={{ scale: 1.04 }}
      >
        <motion.img
          src={user?.avatar || "/images/hacker.png"}
          alt="User Avatar"
          className="h-64 w-64 rounded-full m-6 object-cover"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          whileHover={{
            scale: 1.1,
            boxShadow: "0 0 35px #00bfff",
            rotate: [0, 2, -2, 0],
          }}
        />
        <motion.div
          className="text-gray-400 text-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            className="text-xl font-medium text-gray-300 self-start mt-4 mb-1"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-gray-500">Email:</span> {user?.email}
          </motion.div>
          <motion.div
            className="text-xl font-medium text-gray-300 self-start mt-1 mb-4"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-gray-500">Username:</span> @{user?.username}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AllProblems;