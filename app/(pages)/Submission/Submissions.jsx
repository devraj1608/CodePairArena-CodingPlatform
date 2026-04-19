"use client";
import React, { useEffect, useState } from "react";
import { getSubmissionService } from "../../../Services/Submissions.service";
import Loading from "../../../Components/Loading/Loading";
import SubmissionCard from "./SubmissionCard";

function Submissions({ problem_id, displayproblem }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = await getSubmissionService(problem_id);
        setSubmissions(response || []);
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problem_id]);

  return (
    <div className="p-4 bg-gray-900 rounded-2xl border border-blue-500 shadow-lg max-h-[80vh] overflow-y-auto transition-all duration-300 ">
      {loading ? (
        <Loading />
      ) : submissions.length === 0 ? (
        <p className="bg-gray-800 rounded-lg text-blue-400 font-extrabold p-4 text-center text-2xl shadow-inner">
          No submissions
        </p>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id || submission._id} // use unique id if available
              submission={submission}
              displayproblem={displayproblem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Submissions;