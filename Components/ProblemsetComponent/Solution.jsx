import React, { useState } from 'react';

function Solution({ solution }) {
  const [openSolution, setOpenSolution] = useState(null);

  const toggleSolution = (lang) => {
    setOpenSolution((prev) => (prev === lang ? null : lang));
  };

  if (!solution || Object.keys(solution).length === 0) {
    return (
      <div className="text-gray-400 p-4">
        No solutions available for this problem.
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-xl p-4">
      {Object.keys(solution).map((lang, index) => (
        <div
          key={index}
          className="border-l-4 border-yellow-500 mb-4 bg-gray-900 rounded-lg"
        >
          <p
            className="cursor-pointer text-yellow-500 font-bold text-lg mb-2 p-4 flex justify-between items-center"
            onClick={() => toggleSolution(lang)}
          >
            {lang.toUpperCase()} Solution
            <span className={`transform transition-transform duration-300 ${openSolution === lang ? 'rotate-180' : ''}`}>
              {openSolution === lang ? '▲' : '▼'}
            </span>
          </p>
          {openSolution === lang && (
            <pre className="p-4 bg-black text-yellow-100 rounded-lg overflow-auto">
              {solution[lang]}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

export default Solution;