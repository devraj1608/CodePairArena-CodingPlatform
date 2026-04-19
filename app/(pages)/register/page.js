"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";
import { registerUser } from "../../../Services/Auth.service"; 
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await registerUser(formData);
      setLoading(false);

      if (success) {
        toast.success("Registered successfully! Redirecting to login...");
        router.push("/login");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Server error. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-[85vh] bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="relative w-[800px] h-[500px] rounded-2xl p-[2px] bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)]">
        <div className="w-full h-full rounded-2xl bg-gray-900 grid grid-cols-2 overflow-hidden relative">
          {/* Diagonal overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent skew-x-12"></div>

          {/* Left Side - Form */}
          <div className="flex flex-col justify-center items-center p-10 z-10">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">Register</h2>
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-blue-400 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-300">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-blue-400 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-300">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-blue-400 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                  required
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg transition disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Submit"}
                </button>
              </div>

              <h4 className="text-gray-300 text-sm mt-4 pl-10">
                Already have an account?{" "}
                <Link href="/login">
                  <span className="text-blue-400 font-semibold hover:text-blue-500 hover:underline transition">
                    Login
                  </span>
                </Link>
              </h4>
            </form>
          </div>

          {/* Right Side - Welcome Section */}
          <div className="flex flex-col justify-center items-center text-center p-10 z-10">
            <h2 className="text-3xl font-extrabold text-blue-400 mb-4">
              Welcome Developer
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Register yourself and continue your journey with us.
            </p>
            <Link href="/">
              <button className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg transition">
                Go Home
              </button>
            </Link>

            <Link href="/auth/google">
              <button className="flex items-center gap-3 px-6 py-2 rounded-lg bg-white hover:bg-gray-100 mt-8 text-gray-800 font-semibold shadow-lg transition">
                <FcGoogle className="text-2xl" />
                <span>Register with Google</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;