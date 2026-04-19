import { toast } from "react-hot-toast";

// ✅ Ensure backend URL is defined
const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!backendURL) {
  console.error(
    "NEXT_PUBLIC_BACKEND_URL is not defined in .env.local. Please add it."
  );
}

// ---------------- LOGIN USER ----------------
export const loginUser = async (userData) => {
  if (!backendURL) return false;

  try {
    const response = await fetch(`${backendURL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      const { accessToken, refreshToken, user } = data.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
      }
      toast.success("Logged in successfully!");
      return true;
    } else {
      toast.error(data?.message || "Login failed");
      return false;
    }
  } catch (error) {
    console.error("Login error:", error);
    toast.error("Server Error");
    return false;
  }
};

// ---------------- REGISTER USER ----------------
export const registerUser = async (userData) => {
  if (!backendURL) return false;

  try {
    const response = await fetch(`${backendURL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Registration Successful!");
      return true;
    } else {
      toast.error(data?.message || "Registration failed");
      return false;
    }
  } catch (error) {
    console.error("Registration error:", error);
    toast.error("Server Error");
    return false;
  }
};

// ---------------- CHECK IF LOGGED IN ----------------
export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
};

// ---------------- GET CURRENT USER PROFILE ----------------
export const getMyProfile = async () => {
  if (!backendURL || typeof window === "undefined") return null;

  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${backendURL}/users/getcurrentuser`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return response.ok ? data.data : null;
  } catch (error) {
    console.error("Get profile error:", error);
    toast.error("Failed to load profile");
    return null;
  }
};

// ---------------- LOGOUT USER ----------------
export const logoutUser = async () => {
  if (!backendURL || typeof window === "undefined") return false;

  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${backendURL}/users/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      toast.success("Logged out successfully!");
      return true;
    } else {
      toast.error("Failed to log out");
      return false;
    }
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Server Error");
    return false;
  }
};

// ---------------- UPDATE AVATAR ----------------
export const updateUserAvatar = async (formData) => {
  if (!backendURL || typeof window === "undefined") return false;

  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${backendURL}/users/updateavatar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.data));
      toast.success("Avatar updated successfully!");
      return true;
    } else {
      toast.error(data?.message || "Failed to update avatar");
      return false;
    }
  } catch (error) {
    console.error("Update avatar error:", error);
    toast.error("Server Error");
    return false;
  }
};

// ---------------- REFRESH TOKEN ----------------
export const refreshTokenService = async () => {
  if (!backendURL || typeof window === "undefined") return false;

  try {
    const token = localStorage.getItem("refreshToken");
    if (!token) return false;

    const response = await fetch(`${backendURL}/users/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token }),
    });

    const data = await response.json();

    if (response.ok) {
      const { accessToken, refreshToken } = data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      return true;
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return false;
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    return false;
  }
};