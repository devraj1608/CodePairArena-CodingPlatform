"use client";
import React, { useEffect, useState } from "react";
import CodingBackground from "../../../Components/CodingBackground";
import { getMyProfile } from "../../../Services/Auth.service";
import { fetchUserTweets } from "../../../Services/Tweet.service";
import Loading from "../../../Components/Loading/Loading";
import ProblemStats from "../../../Components/ProfileComponents/problemState";
import UserDetails from "../../../Components/ProfileComponents/userDetails";
import UserTweets from "../../../Components/ProfileComponents/userTweets";
import Submissions from "../Submission/Submissions.jsx";
import { useRouter } from "next/navigation";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [activeTab, setActiveTab] = useState("submissions");
  const router = useRouter();

  const fetchUserProfile = async () => {
    try {
      const response = await getMyProfile();
      if (!response) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.push("/login");
      } else {
        setUser(response);
        const userTweets = await fetchUserTweets();
        if (userTweets) setTweets(userTweets);
        await fetchSolvedProblems();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      router.push("/login");
    }
  };

  const fetchSolvedProblems = async () => {
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
        console.log("✅ Solved problems stats updated:", data?.data?.stats);
        // Fetch updated user profile to refresh stats in UI
        const updatedProfile = await getMyProfile();
        if (updatedProfile) {
          setUser(updatedProfile);
        }
      }
    } catch (error) {
      console.error("❌ Error updating problem stats:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    const handleFocus = () => {
      fetchUserProfile();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [router]);

  if (!user) return <Loading />;

  return (
    <div className="relative min-h-screen text-white p-4 sm:p-6 md:p-10 mb-14">
      {/* Background */}
      <CodingBackground />

      {/* Foreground */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* User Details */}
        <div className="w-full lg:w-1/3 order-1 lg:order-2">
          <UserDetails user={user} />
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-2/3 order-2 lg:order-1 bg-gray-900/70 rounded-lg p-6 sm:p-8 space-y-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
            {user.fullname}
          </h1>

          <hr className="border-blue-600" />

          <ProblemStats user={user} />

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <button
              onClick={() => setActiveTab("submissions")}
              className={`py-2 px-4 text-sm sm:text-base font-extrabold rounded-lg transition-colors duration-300 ${
                activeTab === "submissions"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
            >
              Solved Questions
            </button>
            <button
              onClick={() => setActiveTab("tweets")}
              className={`py-2 px-4 text-sm sm:text-base font-extrabold rounded-lg transition-colors duration-300 ${
                activeTab === "tweets"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
            >
              My Tweets
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-4 rounded-lg bg-gray-900/80">
            {activeTab === "tweets" ? (
              <UserTweets tweets={tweets} />
            ) : (
              <Submissions displayproblem={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;