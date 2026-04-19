"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "../Assets/logo.png";
import { Roboto } from "next/font/google";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react"; // ✅ For mobile toggle icons

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const Navbar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ mobile toggle state

  // ✅ Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Failed to parse user:", err);
        }
      }
    }
  }, []);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/problems", label: "Problemset" },
    { href: "/discuss", label: "Discuss" },
    { href: "/joinInterview", label: "Join Interview" },
    { href: "/hostInterview", label: "Host Interview" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white shadow-lg ${roboto.className}`}
    >
      <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-8">
        {/* 🔥 Logo */}
        <Link
          href="/"
          className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300"
        >
          <Image
            src={logo}
            alt="Logo"
            width={70}
            height={50}
            className="rounded-[50%/25%] border-2 border-white shadow-lg object-cover"
          />
          <span
            className="text-blue-500 font-extrabold text-2xl sm:text-3xl 
             relative
             before:absolute before:-inset-0.5 before:bg-blue-500 before:blur-lg before:opacity-10 before:rounded-md
             hover:scale-105 hover:before:blur-xl
             transition-all duration-300"
          >
            CodePairArena
          </span>
        </Link>

        {/* ✅ Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white focus:outline-none transition-transform duration-300"
        >
          {menuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>

        {/* 🔥 Navigation (Desktop + Mobile) */}
        <nav
          className={`absolute md:static top-[70px] left-0 w-full md:w-auto bg-black/95 md:bg-transparent md:flex md:items-center md:space-x-10 
            flex flex-col md:flex-row space-y-4 md:space-y-0 px-6 py-4 md:p-0 
            transition-all duration-500 ease-in-out z-40 
            ${
              menuOpen
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible -translate-y-4 md:opacity-100 md:visible md:translate-y-0"
            }`}
        >
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-lg font-medium transition duration-300 relative group ${
                  isActive ? "text-blue-400" : "text-gray-300"
                }`}
                onClick={() => setMenuOpen(false)} // ✅ Close on mobile click
              >
                {label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-500 group-hover:w-full"></span>
              </Link>
            );
          })}

          {/* 🔥 User/Profile (Mobile) */}
          <div className="flex md:hidden flex-col items-start space-y-3 mt-3 border-t border-gray-700 pt-3">
            {user ? (
              <Link
                href="/profile"
                className="flex items-center space-x-3"
                onClick={() => setMenuOpen(false)}
              >
                <Image
                  src={
                    user?.avatar && user.avatar.trim() !== ""
                      ? user.avatar
                      : "/images/hacker.png"
                  }
                  alt="User"
                  width={40}
                  height={40}
                  unoptimized
                  className="rounded-full border-2 border-blue-500 shadow-lg object-cover"
                />
                <span className="text-lg font-semibold text-gray-300">
                  {user.username || user.fullname || "User"}
                </span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center px-5 py-2 text-lg font-bold rounded-md bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg transition duration-300 hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center px-5 py-2 text-lg font-bold rounded-md bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-700 text-white shadow-lg transition duration-300 hover:scale-105"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* 🔥 User/Profile (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Link href="/profile" className="flex items-center space-x-3">
              <Image
                src={
                  user?.avatar && user.avatar.trim() !== ""
                    ? user.avatar
                    : "/images/hacker.png"
                }
                alt="User"
                width={45}
                height={45}
                unoptimized
                className="rounded-full border-2 border-blue-500 shadow-lg object-cover"
              />
              <span className="text-lg font-semibold text-gray-300">
                {user.username || user.fullname || "User"}
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 text-lg font-bold rounded-md bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg transition duration-300 hover:scale-110 hover:shadow-[0_0_20px_#3b82f6]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-lg font-bold rounded-md bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-700 text-white shadow-lg transition duration-300 hover:scale-110 hover:shadow-[0_0_20px_#0ea5e9]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;