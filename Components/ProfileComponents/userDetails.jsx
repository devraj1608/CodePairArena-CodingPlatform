"use client";
import React from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "./LogoutButton";

function UserDetails({ user }) {
  const router = useRouter();

  return (
    <div
      className="w-full sm:w-4/4 md:w-3/3 lg:w-3/3 p-4 sm:p-5 rounded-2xl shadow-lg 
                 flex flex-col items-center mx-auto mb-6 lg:mb-0
                 bg-gray-900 border-2 border-blue-500/50 
                 backdrop-blur-md transition-all duration-500"
    >
      {/* ✅ User Avatar */}
      <img
        src={user?.avatar || "/images/hacker.png"}
        alt="User Avatar"
        className="h-32 w-32 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 
                   rounded-full mt-4 mb-6 object-cover 
                   transition-transform duration-300"
      />

      {/* ✅ Edit Avatar Button */}
      <button
        type="button"
        onClick={() => router.push("/editprofile")}
        className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500
                   text-white font-bold py-2 px-4 rounded-lg w-full max-w-xs m-4
                   transition-all duration-300"
      >
        Edit Avatar
      </button>

      {/* ✅ User Info */}
      <div className="w-full text-base sm:text-lg md:text-xl font-medium text-gray-300 self-start mt-2 mb-1 break-words">
        <span className="text-gray-500">Email:</span> {user?.email}
      </div>
      <div className="w-full text-base sm:text-lg md:text-xl font-medium text-gray-300 self-start mt-1 mb-4 break-words">
        <span className="text-gray-500">Username:</span> @{user?.username}
      </div>

      {/* ✅ Logout Button */}
      <div className="w-full flex justify-center">
        <LogoutButton />
      </div>
    </div>
  );
}

export default UserDetails;