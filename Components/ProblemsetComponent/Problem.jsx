"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "../Loading/Loading";
import Solution from "./Solution";
import Description from "./Description";
import DiscussProblem from "./DiscussProblem";
import EditorBox from "../Editor/EditorBox";
import Submissions from "../Submission/Submissions";
import { getProblemService } from "../../Services/Problem.service";
import { getSolvedProblemService } from "../../Services/Submissions.service";

const difficultyColors = {
  easy: "bg-green-500 text-white",
  medium: "bg-yellow-500 text-white",
  hard: "bg-red-600 text-white",
};

export default function ProblemPage({ params }) {
  const { id } = params; // From Next.js app router dynamic route
  const searchParams = useSearchParams();
  const initialSolved = searchParams.get("solved") === "true";

  const [problem, setProblem] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [isSolved, setIsSolved] = useState(initialSolved);

  // ✅ Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await getProblemService(id);
        if (data) setProblem(data);
      } catch (err) {
        console.error("Error fetching problem:", err);
      }
    };
    fetchProblem();
  }, [id]);

  // ✅ Check if problem is solved (refresh on every tab change or component focus)
  useEffect(() => {
    const checkSolvedStatus = async () => {
      try {
        const solvedProblems = await getSolvedProblemService();
        if (solvedProblems && solvedProblems.has(id)) {
          console.log("✅ Problem is solved!");
          setIsSolved(true);
        } else {
          console.log("⏳ Problem not solved yet");
          setIsSolved(false);
        }
      } catch (err) {
        console.error("Error checking solved status:", err);
      }
    };

    checkSolvedStatus();

    // Check solved status every 2 seconds to detect new submissions
    const interval = setInterval(checkSolvedStatus, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (!problem) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-800 text-white flex p-8">
      <div className="w-1/2 min-h-screen p-7 bg-gray-900 rounded-lg mr-3">
        <div className="flex justify-between bg-gray-900 pb-4 border-b-2 border-gray-700 mb-4">
          <div className="flex">
            {["description", "solution", "discuss", "submissions"].map((tab) => (
              <button
                key={tab}
                className={`mx-2 px-4 py-2 font-semibold rounded-lg focus:outline-none transition duration-300 ${
                  activeTab === tab
                    ? "bg-yellow-500 text-white shadow-lg"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div>
            {isSolved && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 bg-black rounded-full"
                viewBox="0 0 20 20"
                fill="green"
                title="Problem Solved!"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        <h1 className="text-4xl font-semibold mb-4">{problem.title}</h1>
        <div className="flex items-center mb-4">
          <span
            className={`text-sm font-semibold px-4 py-1 rounded ${difficultyColors[problem.difficulty]}`}
          >
            {problem.difficulty}
          </span>
        </div>

        {activeTab === "description" && <Description problem={problem} />}
        {activeTab === "solution" && <Solution solution={problem.solution} />}
        {activeTab === "discuss" && <DiscussProblem id={id} />}
        {activeTab === "submissions" && (
          <Submissions problem_id={id} displayproblem={false} />
        )}
      </div>

      <div className="w-1/2 min-h-screen p-7 bg-gray-900 ml-3 rounded-lg">
        <EditorBox problem={problem} />
      </div>
    </div>
  );
}