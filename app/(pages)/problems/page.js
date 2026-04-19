"use client";

import React, { useEffect, useState } from "react";
import CodingBackground from "../../../Components/CodingBackground";
import AllProblems from "../../../Components/ProblemsetComponent/AllProblems";
import { getMyProfile } from "../../../Services/Auth.service"; // Make sure this function exists

export default function ProblemsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const loggedInUser = await getMyProfile(); // fetch the logged-in user info
      setUser(loggedInUser);
    };
    fetchUser();
  }, []);

  if (!user) return <div className="text-white text-center mt-20">Loading user...</div>;

  return (
    <>
      <CodingBackground />
      <AllProblems user={user} />
    </>
  );
}