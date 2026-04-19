"use client";
import React, { useEffect, useState } from "react";

function ProblemStats({ user }) {
  const [totalProblems, setTotalProblems] = useState({
    easy: 11,
    medium: 3,
    hard: 5,
  });
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Fetch total problems count from backend
  const fetchTotalProblems = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/problems`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const problems = data?.data || [];
        const counts = {
          easy: problems.filter((p) => p.difficulty === "easy").length,
          medium: problems.filter((p) => p.difficulty === "medium").length,
          hard: problems.filter((p) => p.difficulty === "hard").length,
        };
        setTotalProblems(counts);
        console.log("✅ Fetched total problems:", counts);
      }
    } catch (error) {
      console.error("❌ Error fetching total problems:", error);
    }
  };

  // ✅ Refresh user stats from backend
  const refreshStats = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/submissions/solved`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Stats refreshed:", data.data);
        // Trigger a page refresh to get updated user data
        window.location.reload();
      }
    } catch (error) {
      console.error("❌ Error refreshing stats:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTotalProblems();
  }, []);

  const getPercentage = (count, total) => {
    if (!count || !total) return 0;
    return Math.min((count / total) * 100, 100);
  };

  const bars = [
    {
      label: "Easy",
      color: "green",
      count: user?.easyCount || 0,
      total: totalProblems.easy,
    },
    {
      label: "Medium",
      color: "yellow",
      count: user?.mediumCount || 0,
      total: totalProblems.medium,
    },
    {
      label: "Hard",
      color: "red",
      count: user?.hardCount || 0,
      total: totalProblems.hard,
    },
  ];

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-blue-500 transition-all duration-300 hover:shadow-[0_0_10px_#00bfff]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-500">Problem Stats</h2>
        <button
          onClick={refreshStats}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center mb-4">
          <span className={`text-lg w-24 text-${bar.color}-400 font-semibold`}>
            {bar.label}
          </span>
          <div className="flex-1 bg-gray-800 h-6 rounded-lg relative overflow-hidden shadow-inner">
            <div
              className={`absolute top-0 left-0 h-full rounded-lg transition-all duration-1000`}
              style={{
                width: `${getPercentage(bar.count, bar.total)}%`,
                background:
                  bar.color === "green"
                    ? "linear-gradient(90deg, #00ff88, #00c2ff)"
                    : bar.color === "yellow"
                    ? "linear-gradient(90deg, #ffec00, #ffd500)"
                    : "linear-gradient(90deg, #ff4d4d, #ff1a75)",
                boxShadow: `0 0 5px ${
                  bar.color === "green"
                    ? "#00ff88"
                    : bar.color === "yellow"
                    ? "#ffd500"
                    : "#ff1a75"
                }`,
              }}
            />
          </div>
          <span className="ml-4 text-lg font-semibold text-white">
            {bar.count}
          </span>
          <span className="ml-2 text-sm text-gray-400">/ {bar.total}</span>
        </div>
      ))}

      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-center text-gray-300">
          Total Solved:{" "}
          <span className="font-bold text-blue-400">
            {(user?.easyCount || 0) + (user?.mediumCount || 0) + (user?.hardCount || 0)}/
            {totalProblems.easy + totalProblems.medium + totalProblems.hard}
          </span>
        </p>
      </div>
    </div>
  );
}

export default ProblemStats;