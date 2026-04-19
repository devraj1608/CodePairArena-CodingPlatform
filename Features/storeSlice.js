import { createSlice } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL_FOR_SOCKET;
const socket = io(backendURL, { withCredentials: true });

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    socket: socket,
  },
  reducers: {
    setSocket(state, action) {
      state.socket = action.payload;
    },
  },
});

export const { setSocket } = socketSlice.actions;
export default socketSlice.reducer;
