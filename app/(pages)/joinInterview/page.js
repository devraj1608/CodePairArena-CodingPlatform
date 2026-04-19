'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../../../Features/useSocket.js';
import { isLoggedIn } from '../../../Services/Auth.service.js';
import CodingBackground from '../../../Components/CodingBackground';

function JoinInterview() {
  const { socket } = useSocket();
  const router = useRouter();
  const [room, setRoom] = useState('');
  const [joining, setJoining] = useState(false);   // waiting for host acceptance
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
  }, []);

  // Accepted by host → navigate to room
  const handleJoinRoom = ({ ta, room: acceptedRoom, capacityMode }) => {
    if (!acceptedRoom) return;
    setJoining(false);
    localStorage.setItem('roomRole', 'joiner');
    localStorage.setItem('roomRemoteId', ta);
    localStorage.setItem('roomCapacity', capacityMode || 'single'); // know session type in room
    router.push(`/room/${acceptedRoom}`);
  };

  // Room full or doesn't exist
  const handleJoinError = ({ message }) => {
    setJoining(false);
    setError(message || 'Could not join room.');
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('room:join', handleJoinRoom);
    socket.on('room:join_error', handleJoinError);
    return () => {
      socket.off('room:join', handleJoinRoom);
      socket.off('room:join_error', handleJoinError);
    };
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmed = room.trim().toUpperCase();
    if (!trimmed) return setError('Please enter a valid Room ID.');

    const storedUser = localStorage.getItem('user');
    if (!storedUser) return setError('Please login first.');

    if (!socket) return setError('Connection not ready. Please wait a moment.');

    const user = JSON.parse(storedUser);
    setJoining(true);
    // Send full room code (with prefix if provided, backend will normalize)
    socket.emit('room:join_request', { room: trimmed, user, id: socket.id });
  };

  const handleCancel = () => {
    setJoining(false);
    setError('');
  };

  return (
    <>
      <CodingBackground />
      <div className="min-h-[80vh] flex flex-col lg:flex-row text-white p-6 lg:p-10 items-center justify-center gap-10">

        {/* Left — Illustration */}
        <div className="w-full lg:w-1/3 flex items-center justify-center rounded-2xl p-6 bg-gray-900/70 backdrop-blur-md shadow-xl border border-gray-700">
          <img
            src="/images/hacker.png"
            alt="Join Interview"
            className="h-72 w-72 lg:h-96 lg:w-96 rounded-full object-cover shadow-2xl transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Right — Form */}
        <div className="w-full lg:w-2/3 flex items-center justify-center">
          {!mounted ? null : loggedIn ? (
            <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-10 rounded-2xl w-full max-w-lg shadow-2xl">

              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                   Join a Room
                </h2>
                <p className="text-gray-400 text-base">
                  Enter the Room ID shared by your interviewer.
                </p>
              </div>

              {/* Waiting State */}
              {joining ? (
                <div className="flex flex-col items-center gap-6 py-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">🔔</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xl mb-1">Waiting for host...</p>
                    <p className="text-gray-400 text-sm">
                      Your request has been sent to room{' '}
                      <span className="text-blue-400 font-mono font-bold">{room.toUpperCase()}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      The host will accept your request shortly.
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-xl bg-red-600/30 border border-red-500 text-red-400 hover:bg-red-600/50 transition-all text-sm font-semibold"
                  >
                    ✕ Cancel Request
                  </button>
                </div>
              ) : (
                /* Join Form */
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label
                      htmlFor="roomId"
                      className="block text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2"
                    >
                      Room ID
                    </label>
                    <input
                      type="text"
                      id="roomId"
                      value={room}
                      onChange={(e) => { setRoom(e.target.value.toUpperCase()); setError(''); }}
                      placeholder="e.g. AB3XYZ"
                      maxLength={10}
                      className="w-full px-5 py-4 rounded-xl bg-gray-800 border border-gray-600 text-white text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 transition-all duration-300"
                    />
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-900/40 border border-red-600 text-red-300 text-sm">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white font-bold text-lg tracking-wide shadow-lg hover:shadow-blue-900/40 transition-all duration-300"
                  >
                    Join Room →
                  </button>

                  <p className="text-center text-xs text-gray-500">
                    You'll wait in a lobby until the host accepts your request.
                  </p>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-12 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-gray-100 mb-3">Login Required</h2>
                <p className="text-gray-400 mb-6">
                  Please log in to join an interview room.
                </p>
                <a
                  href="/login"
                  className="inline-block px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition duration-300 font-semibold"
                >
                  Login Now
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default JoinInterview;
