"use client";

import { useSelector } from "react-redux";

export const useSocket = () => {
  // Only use selector on the client
  if (typeof window === "undefined") return { socket: null, isConnected: false };

  // Optional: use a try-catch to avoid undefined store errors
  try {
    const socket = useSelector((state) => state.socket?.socket);
    return { socket, isConnected: socket?.connected || false };
  } catch (err) {
    return { socket: null, isConnected: false };
  }
};
