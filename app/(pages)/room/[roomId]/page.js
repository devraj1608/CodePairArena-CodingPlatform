'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '../../../../Features/useSocket.js';
import { runExampleCasesService } from '../../../../Services/CodeRun.service.js';
import { getAllProblemsService } from '../../../../Services/Problem.service.js';
import { defaultCodes, enterFullScreen } from '../../../../Components/InterviewRoomComponent/helper.js';
import peer from '../../../../Services/peer.js';
import Loading from '../../../../Components/Loading/Loading.jsx';
import GroupRoom from '../../../../Components/InterviewRoomComponent/GroupRoom.jsx';
import InterviewRoom from '../../../../Components/InterviewRoomComponent/InterviewRoom.jsx';
import { useGroupWebRTC } from '../../../../Features/useGroupWebRTC.js';
import { toast } from 'react-hot-toast';

function Room() {
  const router = useRouter();
  const params = useParams();
  const { roomId } = params;
  const { socket, isConnected } = useSocket();

  // ── State ──────────────────────────────────────────────────────────────────
  const [question, setQuestion] = useState('');
  const [show_share_streams, setShowShareStreams] = useState(0);
  const [code, setCode] = useState(defaultCodes.cpp);
  const [cases, setCases] = useState([{ id: 1, input: '', output: '' }, { id: 2, input: '', output: '' }]);
  const [remoteUser, setRemoteUser] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [requestUsername, setRequestUsername] = useState([]);
  const [connectionReady, setConnectionReady] = useState(false);
  const [privilege, setPrivilege] = useState(false);
  const [capacityMode, setCapacityMode] = useState('single');
  const [participants, setParticipants] = useState([]); // group mode: [{ id, user }]
  const [hostSocketId, setHostSocketId] = useState(null); // group mode: the host's socket id (stored by joiners)
  const [exampleCasesExecution, setExampleCasesExecution] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [language, setLanguage] = useState('cpp');
  const [theme, setTheme] = useState('vs-dark');
  const [executing, setExecuting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isAudioOn, setAudioOn] = useState(true);
  const [isVideoOn, setVideoOn] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [streamReady, setStreamReady] = useState(false);
  const cameraStreamRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false); // Track if session stream is live
  
  const localUser = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('user') || '{}' : '{}');

  // Initialize Group WebRTC Hook
  const groupWebRTC = useGroupWebRTC(socket, myStream, roomId, localUser);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const waitingForReadyRef = useRef(false);
  const remoteSocketIdRef = useRef(null);
  const privilegeRef = useRef(false);
  const capacityModeRef = useRef('single');
  const hostSocketIdRef = useRef(null);

  useEffect(() => { remoteSocketIdRef.current = remoteSocketId; }, [remoteSocketId]);
  useEffect(() => { privilegeRef.current = privilege; }, [privilege]);
  useEffect(() => { capacityModeRef.current = capacityMode; }, [capacityMode]);
  useEffect(() => { hostSocketIdRef.current = hostSocketId; }, [hostSocketId]);

  // derived — use roomId prefix as the authoritative source (GRP_ = group, 1ON_ = interview)
  const isGroupMode = roomId?.startsWith('GRP_') ?? (capacityMode === 'group');

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => { setMyStream(stream); cameraStreamRef.current = stream; setStreamReady(true); })
      .catch(() => setStreamReady(true)); // host can enter without camera
  }, []);

  // ── Remote stream (WebRTC) ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (ev) => setRemoteStream(ev.streams[0]);
    peer.peer.addEventListener('track', handler);
    return () => peer.peer.removeEventListener('track', handler);
  }, []);

  // ── WebRTC negotiation (single mode only) ──────────────────────────────────
  useEffect(() => {
    if (!socket || !remoteSocketId || capacityModeRef.current === 'group') return;
    const handleNeg = async () => {
      const offer = await peer.getOffer();
      socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
    };
    peer.peer.addEventListener('negotiationneeded', handleNeg);
    return () => peer.peer.removeEventListener('negotiationneeded', handleNeg);
  }, [remoteSocketId, socket]);

  // ── Room init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId || !isConnected || !socket) return;

    const role = localStorage.getItem('roomRole');
    const remoteId = localStorage.getItem('roomRemoteId');
    // Use roomId prefix as the authoritative mode — localStorage is a fallback only
    const prefixMode = roomId?.startsWith('GRP_') ? 'group' : 'single';
    const storedMode = localStorage.getItem('roomCapacity') || prefixMode;
    const mode = prefixMode !== 'single' ? prefixMode : storedMode; // prefix wins
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    setCapacityMode(mode);
    capacityModeRef.current = mode;
    const _isGroup = mode === 'group';

    if (role === 'host') {
      setPrivilege(true);
      privilegeRef.current = true;
      socket.emit('room:join', { room: roomId, user, id: socket.id, role: 'host' });
      
      // For group mode, mark stream as started when host joins
      if (_isGroup) {
        setTimeout(() => {
          socket.emit('stream:started', { room: roomId });
          setStreamActive(true);
        }, 500);
      }
      
      getAllProblemsService().then((fetched) => {
        setProblems(fetched || []);
        setLoadingProblems(false);
      });
    } else if (role === 'joiner' && remoteId) {
      // remoteId is the host's socket id (stored as 'ta' when accepted)
      setRemoteSocketId(remoteId);
      remoteSocketIdRef.current = remoteId;
      setConnectionReady(true);

      if (_isGroup) {
        // In group mode store host socket id separately for leave events
        setHostSocketId(remoteId);
        hostSocketIdRef.current = remoteId;
      }

      socket.emit('room:join', { room: roomId, user, id: socket.id });

      if (_isGroup) {
        // Group mode: no WebRTC video, no fullscreen enforcement
        // just join the socket room — code is synced via room broadcasts
      } else {
        // Single/interview mode: enter fullscreen + initiate WebRTC
        setShowShareStreams(1);
        enterFullScreen();
        socket.emit('joiner-ready', { room: roomId, to: remoteId });
      }
    }

    // Do NOT clean up localStorage here — if socket reconnects or strict mode runs,
    // this would wipe the session and break the host's privileges.
  }, [roomId, isConnected, socket]);

  // ── Session Cleanup ────────────────────────────────────────────────────────
  // We explicitly do NOT clear localStorage on unmount. If the user refreshes
  // the page, unmount is triggered, and clearing it would destroy their session
  // role, causing bugs like the host losing privileges. Cleanup is handled in exitRoom.

  // ── sendStreams (single mode only) ─────────────────────────────────────────
  const sendStreams = useCallback(() => {
    if (myStream) {
      const senders = peer.peer.getSenders();
      myStream.getTracks().forEach((track) => {
        if (!senders.some((s) => s.track === track)) peer.peer.addTrack(track, myStream);
      });
    }
    if (!privilegeRef.current) socket.emit('set:share_streams', { to: remoteSocketIdRef.current });
    setShowShareStreams(0);
  }, [myStream, socket]);

  // ── Core socket event handlers ─────────────────────────────────────────────
  const handleJoinRequest = useCallback(({ user, joinerSocketId, clientId, streamStarted, participantCount }) => {
    if (!privilegeRef.current) return;
    console.log(`[FRONTEND] Received join request from ${user?.username} (socket: ${joinerSocketId}), current participants: ${participantCount}`);
    setRequestUsername((prev) => {
      // Prevent duplicates
      if (prev.some(r => r.joinerSocketId === joinerSocketId)) {
        console.log(`[FRONTEND] Request already in queue, ignoring duplicate`);
        return prev;
      }
      const newRequest = { user, joinerSocketId, clientId, streamStarted, participantCount };
      console.log(`[FRONTEND] Adding new request. Total pending: ${prev.length + 1}`);
      return [...prev, newRequest];
    });
  }, []);

  const acceptRequest = useCallback((index) => {
    setRequestUsername((prev) => {
      const entry = prev[index];
      if (!entry) return prev;

      console.log(`[FRONTEND] Accepting request from ${entry.user?.username}`);
      socket.emit('host:req_accepted', {
        ta: socket.id, user: entry.user, room: roomId,
        joinerSocketId: entry.joinerSocketId, clientId: entry.clientId,
      });

      if (capacityModeRef.current === 'group') {
        // Do NOT add to participants here — wait for group:participant_joined
        // socket event which fires after the joiner actually mounts the page.
        // Adding here AND in the socket event is the root cause of duplicate tiles.
        return prev.filter((_, i) => i !== index);
      } else {
        setConnectionReady(true);
        setRemoteUser(entry.user);
        setRemoteSocketId(entry.joinerSocketId);
        remoteSocketIdRef.current = entry.joinerSocketId;
        waitingForReadyRef.current = true;
        return [];
      }
    });
  }, [socket, roomId]);

  const denyRequest = useCallback((index) => {
    setRequestUsername((prev) => {
      const entry = prev[index];
      if (!entry) return prev;
      console.log(`[FRONTEND] Denying request from ${entry.user?.username}`);
      socket.emit('host:req_denied', { joinerSocketId: entry.joinerSocketId, room: roomId });
      return prev.filter((_, i) => i !== index);
    });
  }, [socket, roomId]);

  const handleHostLeft = useCallback(() => {
    if (myStream) myStream.getTracks().forEach((t) => t.stop());
    setMyStream(null);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    toast.error('Host ended the session');
    router.push('/joinInterview');
  }, [myStream, router]);

  const handleIntervieweeLeft = useCallback(({ msg }) => {
    if (!msg) {
      toast.error('A participant left the room');
      setConnectionReady(false);
      setRemoteSocketId(null);
      remoteSocketIdRef.current = null;
      setRemoteStream(null);
    } else {
      toast.error(msg);
    }
  }, []);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    const answer = await peer.getAnswer(offer);
    setRemoteSocketId(from);
    remoteSocketIdRef.current = from;
    socket.emit('call:accepted', { to: from, answer });
  }, [socket]);

  const handleCallAccepted = useCallback(async ({ answer }) => {
    await peer.setLocalDescription(answer);
    sendStreams();
  }, [sendStreams]);

  const handleNegotiationIncoming = useCallback(async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit('peer:nego:done', { to: from, ans });
  }, [socket]);

  const handleFinalNego = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  // Keep stable refs to groupWebRTC functions to avoid re-registering listeners
  const groupWebRTCRef = useRef(groupWebRTC);
  useEffect(() => { groupWebRTCRef.current = groupWebRTC; }, [groupWebRTC]);
  const isGroupModeRef = useRef(isGroupMode);
  useEffect(() => { isGroupModeRef.current = isGroupMode; }, [isGroupMode]);

  // ── Register all socket listeners ──────────────────────────────────────────
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onCodeChange = ({ code }) => setCode(code);
    const onQuestionChange = ({ question }) => setQuestion(question);
    const onLanguageChange = ({ language }) => { setLanguage(language); setCode(defaultCodes[language]); };
    const onCasesChange = ({ cases }) => setCases(cases);
    const onCodeRun = ({ exampleCasesExecution }) => setExampleCasesExecution(exampleCasesExecution);
    const onCodeExecuting = ({ executing }) => {
      setExecuting(executing);
      if (executing) setExampleCasesExecution(null);
    };
    const onSetShareStreams = () => { if (privilegeRef.current) setShowShareStreams(1); };

    // Group mode: a participant left — remove from list
    const onGroupParticipantLeft = ({ socketId }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== socketId));
      if (isGroupModeRef.current) groupWebRTCRef.current.removePeer(socketId);
      toast.error('A participant left the session');
    };

    // Group mode: a new participant joined — add to list (single source of truth)
    const onGroupParticipantJoined = ({ user, socketId, totalParticipants }) => {
      console.log(`[FRONTEND] Participant joined: ${user?.username} (${socketId}), Total: ${totalParticipants}`);
      // Ignore if this event is for our own socket (can happen if server echoes to all)
      if (socket && socketId === socket.id) return;
      setParticipants((prev) => {
        if (prev.some(p => p.id === socketId)) return prev; // deduplicate
        return [...prev, { id: socketId, user }];
      });
      // Initiate WebRTC mesh call to the new participant (host side)
      if (isGroupModeRef.current) {      // All existing participants call the new participant to establish a full-mesh topology.
        // This ensures everyone sees everyone's camera, not just the host's.
        groupWebRTCRef.current.callUser(socketId);
      }
    };

    // Joiner: host denied the request — redirect back
    const onJoinDenied = ({ message }) => {
      toast.error(message || 'Your request was denied by the host.');
      router.push('/joinInterview');
    };

    // Stream status updated
    const onStreamActive = ({ started }) => {
      setStreamActive(started);
    };

    const handleIncomingCallLocal = (data) => {
      if (isGroupModeRef.current) {
        groupWebRTCRef.current.handleIncomingCall(data);
        if (data.user) {
          setParticipants((prev) => {
            if (prev.some(p => p.id === data.from)) return prev;
            return [...prev, { id: data.from, user: data.user }];
          });
        }
      } else {
        setRemoteSocketId(data.from);
        remoteSocketIdRef.current = data.from;
        peer.getAnswer(data.offer).then((answer) => {
          socket.emit('call:accepted', { to: data.from, answer });
        });
      }
    };

    const handleCallAccepted = (data) => {
      if (isGroupModeRef.current) {
        groupWebRTCRef.current.handleCallAccepted(data);
      } else {
        peer.setLocalDescription(data.answer);
        console.log('Call accepted, sending streams');
        sendStreams();
      }
    };

    const handleNegotiationIncoming = async (data) => {
      if (isGroupModeRef.current) {
        groupWebRTCRef.current.handleNegoNeeded(data);
      } else {
        const { from, offer } = data;
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', { to: from, ans });
      }
    };

    const handleFinalNego = async (data) => {
      if (isGroupModeRef.current) {
        groupWebRTCRef.current.handleNegoFinal(data);
      } else {
        const { ans } = data;
        await peer.setLocalDescription(ans);
      }
    };

    const onJoinerReady = ({ from }) => {
      if (waitingForReadyRef.current && from === remoteSocketIdRef.current) {
        waitingForReadyRef.current = false;
        peer.getOffer().then((offer) => {
          socket.emit('user:call', { remoteSocketId: from, offer });
          socket.emit('host-ready', { to: from });
        });
      }
    };

    socket.on('user:requested_to_join', handleJoinRequest);
    socket.on('host:hasleft', handleHostLeft);
    socket.on('interviewee:hasleft', handleIntervieweeLeft);
    socket.on('group:participant_left', onGroupParticipantLeft);
    socket.on('group:participant_joined', onGroupParticipantJoined);
    socket.on('room:join_denied', onJoinDenied);
    socket.on('stream:active', onStreamActive);
    socket.on('change:code', onCodeChange);
    socket.on('change:question', onQuestionChange);
    socket.on('change:language', onLanguageChange);
    socket.on('change:cases', onCasesChange);
    socket.on('run:code', onCodeRun);
    socket.on('code:executing', onCodeExecuting);
    socket.on('incomming:call', handleIncomingCallLocal);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('peer:nego:needed', handleNegotiationIncoming);
    socket.on('peer:nego:final', handleFinalNego);
    socket.on('set:share_streams', onSetShareStreams);
    socket.on('joiner-ready', onJoinerReady);

    return () => {
      socket.off('user:requested_to_join', handleJoinRequest);
      socket.off('host:hasleft', handleHostLeft);
      socket.off('interviewee:hasleft', handleIntervieweeLeft);
      socket.off('group:participant_left', onGroupParticipantLeft);
      socket.off('group:participant_joined', onGroupParticipantJoined);
      socket.off('room:join_denied', onJoinDenied);
      socket.off('stream:active', onStreamActive);
      socket.off('change:code', onCodeChange);
      socket.off('change:question', onQuestionChange);
      socket.off('change:language', onLanguageChange);
      socket.off('change:cases', onCasesChange);
      socket.off('run:code', onCodeRun);
      socket.off('code:executing', onCodeExecuting);
      socket.off('incomming:call', handleIncomingCallLocal);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('peer:nego:needed', handleNegotiationIncoming);
      socket.off('peer:nego:final', handleFinalNego);
      socket.off('set:share_streams', onSetShareStreams);
      socket.off('joiner-ready', onJoinerReady);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected]);

  // ── Anti-cheat (single/interview mode joiner only) ─────────────────────────
  useEffect(() => {
    if (privilege || isGroupMode) return; // host and group sessions are exempt
    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        toast.error('You tried to exit fullscreen');
        socket?.emit('interviewee:leave', { remoteSocketId: remoteSocketIdRef.current, room: roomId, msg: 'Interviewee exited fullscreen' });
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        toast.error('You tried to switch tab');
        socket?.emit('interviewee:leave', { remoteSocketId: remoteSocketIdRef.current, room: roomId, msg: 'Interviewee switched tab' });
      }
    };
    document.addEventListener('fullscreenchange', onFullscreen);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [privilege, isGroupMode, socket, roomId]);

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(defaultCodes[newLang]);
    if (isGroupMode) {
      socket.emit('room:language:change', { room: roomId, language: newLang });
    } else {
      socket.emit('language:change', { remoteSocketId, language: newLang });
    }
  };

  const handleInputChange = (index, field, value) => {
    if (!privilege) return;
    const updated = [...cases];
    updated[index][field] = value;
    setCases(updated);
    if (isGroupMode) {
      socket.emit('room:cases:change', { room: roomId, cases: updated });
    } else {
      socket.emit('cases:change', { remoteSocketId, cases: updated });
    }
  };

  const clickRun = async () => {
    setExampleCasesExecution(null);
    setExecuting(true);
    
    // Broadcast executing state start
    if (isGroupMode) {
      socket.emit('room:code:executing', { room: roomId, executing: true });
    } else {
      socket.emit('code:executing', { remoteSocketId, executing: true });
    }

    const response = await runExampleCasesService(language, code, cases);
    if (response) setExampleCasesExecution(response);

    // Broadcast results and executing state end
    if (isGroupMode) {
      socket.emit('room:code:run', { room: roomId, exampleCasesExecution: response });
      socket.emit('room:code:executing', { room: roomId, executing: false });
    } else {
      socket.emit('code:run', { remoteSocketId, exampleCasesExecution: response });
      socket.emit('code:executing', { remoteSocketId, executing: false });
    }
    
    setExecuting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); })
      .catch(() => {});
  };

  const handleProblemSelect = (problemId) => {
    const p = problems.find((x) => x._id === problemId);
    if (!p) return;
    setQuestion(p.description);
    const mapped = (p.test_cases || p.example_cases || []).map((tc, i) => ({ id: i + 1, input: tc.input, output: tc.output }));
    const newCases = mapped.length > 0 ? mapped : [{ id: 1, input: '', output: '' }, { id: 2, input: '', output: '' }];
    setCases(newCases);
    socket.emit('change:question', { room: roomId, question: p.description });
    socket.emit('change:cases', { room: roomId, cases: newCases });
  };

  const changeCode = (val) => {
    setCode(val);
    if (isGroupMode) {
      socket.emit('room:code:change', { room: roomId, code: val });
    } else {
      socket.emit('code:change', { remoteSocketId, code: val });
    }
  };

  const changeQuestion = (e) => {
    setQuestion(e.target.value);
    if (isGroupMode) {
      socket.emit('change:question', { room: roomId, question: e.target.value });
    } else {
      socket.emit('question:change', { remoteSocketId, question: e.target.value });
    }
  };

  const exitRoom = () => {
    if (myStream) myStream.getTracks().forEach((t) => t.stop());
    setMyStream(null);
    localStorage.removeItem('roomRole');
    localStorage.removeItem('roomRemoteId');
    localStorage.removeItem('roomCapacity');
    
    if (privilege) {
      // host:leave now only needs the room — backend broadcasts to all members
      socket.emit('host:leave', { room: roomId });
      router.push('/hostInterview');
    } else {
      if (capacityModeRef.current === 'group') {
        // Group mode: notify host via dedicated event with their socket id
        socket.emit('group:leave', {
          hostSocketId: hostSocketIdRef.current,
          room: roomId,
          user: JSON.parse(localStorage.getItem('user') || '{}'),
        });
      } else {
        socket.emit('interviewee:leave', { remoteSocketId: remoteSocketIdRef.current, room: roomId, msg: '' });
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      }
      router.push('/joinInterview');
    }
  };

  const removeParticipant = (participantId) => {
    socket.emit('interviewee:leave', { remoteSocketId: participantId, room: roomId, msg: 'Removed by host' });
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
  };

  if (!streamReady) return <Loading />;



  const sharedProps = {
    roomId, privilege, cases, executing, exampleCasesExecution, localUser, hostSocketId,
    language, theme, code, isAudioOn, isVideoOn, myStream, showQuestion,
    question, problems, loadingProblems, copySuccess, requestUsername,
    setAudioOn, setVideoOn, setExampleCasesExecution, setShowQuestion, setTheme,
    exitRoom, handleCopy, acceptRequest, denyRequest, removeParticipant,
    handleLanguageChange, handleProblemSelect, handleInputChange,
    changeCode, changeQuestion, clickRun, setMyStream, cameraStreamRef
  };

  if (isGroupMode) {
    return (
      <GroupRoom
        {...sharedProps}
        participants={participants}
        streamActive={streamActive}
        remoteStreams={groupWebRTC.remoteStreams}
        replaceStream={groupWebRTC.replaceStream}
      />
    );
  }

  return (
    <InterviewRoom
      {...sharedProps}
      connectionReady={connectionReady}
      remoteUser={remoteUser}
      remoteStream={remoteStream}
      show_share_streams={show_share_streams}
      remoteSocketId={remoteSocketId}
      sendStreams={sendStreams}
    />
  );
}

export default Room;
