import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] }
  ]
};

export function useGroupWebRTC(socket, myStream, roomId, localUser) {
  const [remoteStreams, setRemoteStreams] = useState({});
  const peersRef = useRef(new Map()); // socketId -> RTCPeerConnection

  // Helper to create a new peer connection
  const createPeer = useCallback((targetSocketId) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    
    // Add local tracks
    if (myStream) {
      myStream.getTracks().forEach(track => {
        peer.addTrack(track, myStream);
      });
    }

    // Handle remote tracks
    peer.ontrack = (ev) => {
      setRemoteStreams(prev => {
        const stream = ev.streams && ev.streams[0] ? ev.streams[0] : new MediaStream([ev.track]);
        return {
          ...prev,
          [targetSocketId]: stream
        };
      });
    };

    // Negotiation handles track additions (like delayed camera or screen share)
    let negoTimeout = null;
    peer.onnegotiationneeded = () => {
      // Debounce the negotiation to avoid firing simultaneously with the initial call
      if (negoTimeout) clearTimeout(negoTimeout);
      negoTimeout = setTimeout(async () => {
        try {
          // If signaling is already in progress, don't interrupt
          if (peer.signalingState !== 'stable') return;
          
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          await waitForIceGathering(peer);
          socket.emit('peer:nego:needed', { to: targetSocketId, offer: peer.localDescription });
        } catch (err) {
          console.error('GroupWebRTC Negotiation Error:', err);
        }
      }, 100);
    };

    peersRef.current.set(targetSocketId, peer);
    return peer;
  }, [myStream, socket]);

  // Wait for ICE gathering to complete or timeout after 2 seconds
  const waitForIceGathering = (peer) => {
    return new Promise((resolve) => {
      if (peer.iceGatheringState === 'complete') return resolve();
      const checkState = () => {
        if (peer.iceGatheringState === 'complete') {
          peer.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };
      peer.addEventListener('icegatheringstatechange', checkState);
      setTimeout(() => {
        peer.removeEventListener('icegatheringstatechange', checkState);
        resolve(); // resolve anyway after 2 seconds to not block forever
      }, 2000);
    });
  };

  // Handle incoming call (Offer)
  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    let peer = peersRef.current.get(from);
    if (!peer) peer = createPeer(from);

    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    await waitForIceGathering(peer);
    
    socket.emit('call:accepted', { to: from, answer: peer.localDescription });
  }, [createPeer, socket]);

  // Handle accepted call (Answer)
  const handleCallAccepted = useCallback(async ({ from, answer }) => {
    const peer = peersRef.current.get(from);
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }, []);

  // Handle incoming negotiation needed
  const handleNegoNeeded = useCallback(async ({ from, offer }) => {
    const peer = peersRef.current.get(from);
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await waitForIceGathering(peer);
      socket.emit('peer:nego:done', { to: from, ans: peer.localDescription });
    }
  }, [socket]);

  // Handle final negotiation
  const handleNegoFinal = useCallback(async ({ from, ans }) => {
    const peer = peersRef.current.get(from);
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }, []);

  // Initiate call to a specific user
  const callUser = useCallback(async (targetSocketId) => {
    // Guard: don't create a duplicate peer if one already exists
    if (peersRef.current.has(targetSocketId)) {
      console.warn(`[GroupWebRTC] Peer for ${targetSocketId} already exists, skipping duplicate callUser`);
      return;
    }
    const peer = createPeer(targetSocketId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await waitForIceGathering(peer);
    socket.emit('user:call', { remoteSocketId: targetSocketId, offer: peer.localDescription, user: localUser });
  }, [createPeer, socket, localUser]);

  // Add tracks dynamically if local stream changes
  useEffect(() => {
    peersRef.current.forEach(peer => {
      if (myStream) {
        const senders = peer.getSenders();
        myStream.getTracks().forEach(track => {
          const sender = senders.find(s => s.track && s.track.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            peer.addTrack(track, myStream);
          }
        });
      }
    });
  }, [myStream]);

  // Cleanup peer connection
  const removePeer = useCallback((targetSocketId) => {
    const peer = peersRef.current.get(targetSocketId);
    if (peer) {
      peer.close();
      peersRef.current.delete(targetSocketId);
      setRemoteStreams(prev => {
        const copy = { ...prev };
        delete copy[targetSocketId];
        return copy;
      });
    }
  }, []);

  // Replace entire stream (for screen sharing)
  const replaceStream = useCallback((newStream) => {
    peersRef.current.forEach(peer => {
      const senders = peer.getSenders();
      newStream.getTracks().forEach(track => {
        const sender = senders.find(s => s.track && s.track.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        }
      });
    });
  }, []);

  return {
    remoteStreams,
    callUser,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeeded,
    handleNegoFinal,
    removePeer,
    replaceStream
  };
}
