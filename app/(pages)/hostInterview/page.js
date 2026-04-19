'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../../../Features/useSocket';
import { generateRoomId } from '../../../Components/InterviewRoomComponent/helper';
import { isLoggedIn } from '../../../Services/Auth.service';
import CodingBackground from '../../../Components/CodingBackground';

export default function HostInterview() {
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [capacity, setCapacity] = useState('single'); // 'single' | 'group'

  useEffect(() => setMounted(true), []);

  const handleCreateRoom = (e) => {
    e.preventDefault();

    if (!socket || !isConnected) {
      return alert('Socket not connected, please wait...');
    }

    const storedUser = localStorage.getItem('user');
    if (!storedUser) return alert('Please login first.');
    const user = JSON.parse(storedUser);

    const roomId = generateRoomId(capacity);
    setCreating(true);

    socket.emit(
      'create-room',
      { room: roomId, user, capacity: capacity === 'group' ? 'group' : 1 },
      (response) => {
        if (response?.success) {
          localStorage.setItem('joinedUser', JSON.stringify(user));
          localStorage.setItem('roomRole', 'host');
          localStorage.setItem('roomCapacity', capacity);
          router.push(`/room/${roomId}`);
        } else {
          alert('Failed to create room. Try again.');
          setCreating(false);
        }
      }
    );
  };

  if (!mounted) return null;

  return (
    <>
      <CodingBackground />
      <div className="min-h-[80vh] flex flex-col lg:flex-row text-white p-6 lg:p-10 items-center justify-center gap-10">

        {/* Left — Illustration */}
        <div className="w-full lg:w-1/3 flex items-center justify-center rounded-2xl p-6 bg-gray-900/70 backdrop-blur-md shadow-xl border border-gray-700">
          <img
            src="/images/hacker.png"
            alt="Host Interview"
            className="h-72 w-72 lg:h-96 lg:w-96 rounded-full object-cover shadow-2xl"
          />
        </div>

        {/* Right — Form */}
        <div className="w-full lg:w-2/3 flex items-center justify-center">
          {isLoggedIn() ? (
            <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-10 rounded-2xl w-full max-w-lg shadow-2xl">

              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                   Create a Room
                </h2>
                <p className="text-gray-400 text-base">
                  Choose the room type, then create your session.
                </p>
              </div>

              {/* Capacity Selector */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Room Type
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Single Person */}
                  <button
                    type="button"
                    onClick={() => setCapacity('single')}
                    className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      capacity === 'single'
                        ? 'border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-900/30'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-4xl">🎯</span>
                    <span className="font-bold text-white text-sm">1-on-1 Interview</span>
                    <span className="text-gray-400 text-xs text-center">
                      Private session for one interviewee
                    </span>
                    {capacity === 'single' && (
                      <span className="mt-1 text-xs px-2 py-0.5 bg-blue-500 rounded-full text-white font-semibold">
                        Selected
                      </span>
                    )}
                  </button>

                  {/* Group */}
                  <button
                    type="button"
                    onClick={() => setCapacity('group')}
                    className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      capacity === 'group'
                        ? 'border-purple-500 bg-purple-600/20 shadow-lg shadow-purple-900/30'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-4xl">👥</span>
                    <span className="font-bold text-white text-sm">Group Session</span>
                    <span className="text-gray-400 text-xs text-center">
                      Multiple participants can join
                    </span>
                    {capacity === 'group' && (
                      <span className="mt-1 text-xs px-2 py-0.5 bg-purple-500 rounded-full text-white font-semibold">
                        Selected
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Room ID info */}
              <div className="mb-6 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-400 flex items-center gap-2">
                <span>🔑</span>
                <span>A unique Room ID will be generated automatically when you create the room.</span>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateRoom}
                disabled={creating}
                className={`w-full px-6 py-4 rounded-xl text-white font-bold text-lg tracking-wide shadow-lg transition-all duration-300 ${
                  creating
                    ? 'bg-gray-600 cursor-not-allowed opacity-60'
                    : capacity === 'group'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-purple-900/40'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-blue-900/40'
                }`}
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Room...
                  </span>
                ) : (
                  `Create ${capacity === 'group' ? 'Group' : 'Interview'} Room`
                )}
              </button>
            </div>
          ) : (
            <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-12 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-gray-100 mb-3">Login Required</h2>
                <p className="text-gray-400 mb-6">
                  Please log in to create or host an interview room.
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