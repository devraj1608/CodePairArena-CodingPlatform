import { toast } from 'react-hot-toast';

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Get submissions for a specific problem
export const getSubmissionService = async (problem_id) => {
  try {
    if (typeof window === "undefined") return []; // Server-side safety
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problem_id }),
    });

    const data = await response.json();
    if (response.status === 200) {
      return data.data;
    } else {
      if (typeof window !== "undefined") toast.error(data?.message || "Failed to fetch submissions");
      return [];
    }
  } catch (error) {
    if (typeof window !== "undefined") toast.error("Server error");
    console.error(error);
    return [];
  }
};

// Get all solved problem IDs for the logged-in user
export const getSolvedProblemService = async () => {
  try {
    if (typeof window === "undefined") return null; // Server-side safety
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/submissions/solved`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log("📊 Solved problems response:", data);
    
    if (response.status === 200) {
      // ✅ Extract solved problems from the response
      const solvedProblemsArray = data?.data?.solvedProblems || data?.data || [];
      
      if (Array.isArray(solvedProblemsArray)) {
        const solved = new Set(solvedProblemsArray.map((x) => x.problem._id));
        console.log("✅ Extracted solved problem IDs:", Array.from(solved));
        return solved;
      }
    }
    console.warn("⚠️ No solved problems found or invalid response format");
    return null;
  } catch (error) {
    console.error("❌ Error in getSolvedProblemService:", error);
    return null;
  }
};
