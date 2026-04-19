"use client";
import React from "react";
import { logoutUser } from "../../Services/Auth.service";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await logoutUser();

      if (result) {
        // ✅ Clear tokens (if stored in localStorage)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // ✅ Redirect to login
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-5 py-2.5 m-6 font-semibold text-white 
             bg-red-600 rounded-xl shadow-md 
             hover:bg-red-500 hover:shadow-lg 
             active:bg-gray-600 active:shadow-inner 
             focus:outline-none focus:ring-2 focus:ring-red-400 
             transition-all duration-300 ease-in-out transform 
             hover:scale-105 active:scale-95"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
