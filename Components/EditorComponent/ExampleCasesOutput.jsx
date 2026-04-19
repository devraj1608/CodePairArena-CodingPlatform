"use client";

import React, { useState } from "react";

function ExampleCasesOutput({ exampleCasesExecution }) {
  const [visibleIndex, setVisibleIndex] = useState(0);

  if (!exampleCasesExecution) return null;

  // Runtime error case
  if (exampleCasesExecution.statusCode === 403) {
    return (
      <div className="bg-gradient-to-br from-red-700 to-red-900 p-4 rounded-xl border border-red-500 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚠️</span>
          <h1 className="text-lg font-bold text-white">Runtime Error</h1>
        </div>
        <div className="bg-black/60 rounded-lg p-3 text-red-200 text-xs font-mono overflow-auto max-h-40 whitespace-pre-wrap border border-red-800">
          {exampleCasesExecution.data}
        </div>
      </div>
    );
  }

  const results = exampleCasesExecution.data;
  const allPassed = results.every((r) => r.isMatch);
  const passedCount = results.filter((r) => r.isMatch).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary badge */}
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold ${
          allPassed
            ? "bg-green-700/40 border border-green-500 text-green-300"
            : "bg-red-700/40 border border-red-500 text-red-300"
        }`}
      >
        <span>{allPassed ? "✅ All Passed" : `❌ ${passedCount}/${results.length} Passed`}</span>
        <span className="text-xs font-normal opacity-75">
          {results.length} test case{results.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Test Case Tabs */}
      <div className="flex flex-wrap gap-2">
        {results.map((execution, index) => (
          <button
            key={index}
            onClick={() => setVisibleIndex(index)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
              visibleIndex === index
                ? execution.isMatch
                  ? "bg-green-600 border-green-400 text-white shadow-lg shadow-green-900/40"
                  : "bg-red-600 border-red-400 text-white shadow-lg shadow-red-900/40"
                : "bg-gray-700/60 border-gray-600 text-gray-300 hover:bg-gray-600/60"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                execution.isMatch ? "bg-green-400 text-green-900" : "bg-red-400 text-red-900"
              }`}
            >
              {execution.isMatch ? "✓" : "✗"}
            </span>
            Case {index + 1}
          </button>
        ))}
      </div>

      {/* Active Test Case Detail */}
      {results.map(
        (execution, index) =>
          visibleIndex === index && (
            <div
              key={index}
              className={`rounded-xl border shadow-lg overflow-hidden ${
                execution.isMatch
                  ? "border-green-600 bg-gradient-to-br from-green-900/50 to-green-800/30"
                  : "border-red-600 bg-gradient-to-br from-red-900/50 to-red-800/30"
              }`}
            >
              {/* Case header */}
              <div
                className={`px-4 py-2 flex items-center justify-between ${
                  execution.isMatch ? "bg-green-700/50" : "bg-red-700/50"
                }`}
              >
                <span className="text-sm font-bold text-white">Test Case {index + 1}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    execution.isMatch
                      ? "bg-green-400 text-green-900"
                      : "bg-red-400 text-red-900"
                  }`}
                >
                  {execution.isMatch ? "PASSED" : "FAILED"}
                </span>
              </div>

              {/* Case body – stacked vertically to avoid overflow */}
              <div className="flex flex-col gap-2 p-3">
                {/* Input */}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">
                    Input
                  </p>
                  <pre className="bg-gray-900/80 text-gray-100 text-xs p-2 rounded-lg whitespace-pre-wrap break-all border border-gray-700 max-h-24 overflow-auto font-mono">
                    {execution.input}
                  </pre>
                </div>

                {/* Expected vs Actual side-by-side only if text is short */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">
                      Expected
                    </p>
                    <pre
                      className={`text-xs p-2 rounded-lg whitespace-pre-wrap break-all border max-h-20 overflow-auto font-mono ${
                        execution.isMatch
                          ? "bg-green-900/60 text-green-100 border-green-700"
                          : "bg-gray-900/80 text-gray-100 border-gray-700"
                      }`}
                    >
                      {execution.expectedOutput}
                    </pre>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">
                      Actual
                    </p>
                    <pre
                      className={`text-xs p-2 rounded-lg whitespace-pre-wrap break-all border max-h-20 overflow-auto font-mono ${
                        execution.isMatch
                          ? "bg-green-900/60 text-green-100 border-green-700"
                          : "bg-red-900/60 text-red-200 border-red-700"
                      }`}
                    >
                      {execution.actualOutput}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )
      )}
    </div>
  );
}

export default ExampleCasesOutput;