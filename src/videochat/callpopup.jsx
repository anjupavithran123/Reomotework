// Updated CallPopup.jsx with dynamic participant handling and working browser setup
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';

// Polyfill for global (required for simple-peer in modern bundlers)
if (typeof global === 'undefined') {
  window.global = window;
}

const SIGNALING_SERVER = import.meta.env.REACT_APP_SIGNALING_SERVER || 'http://localhost:4000';

export default function CallPopup({ roomId, userName = 'Guest', open = false, onClose = () => {} }) {
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // { [socketId]: SimplePeer }

  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  const localVideoRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const socket = io(SIGNALING_SERVER);
    socketRef.current = socket;

    async function startLocal() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
          localVideoRef.current.play().catch(() => {});
        }

        socket.emit('join-room', { roomId });

        // Existing participants
        socket.on('all-users', ({ clients }) => {
          clients.forEach(clientId => {
            const peer = createPeer(clientId, socket.id, stream, true);
            peersRef.current[clientId] = peer;
          });
        });

        // New participant joined
        socket.on('user-joined', ({ socketId }) => {
          const peer = createPeer(socketId, socket.id, stream, false);
          peersRef.current[socketId] = peer;
        });

        // Handle incoming signal
        socket.on('signal', ({ from, data }) => {
          if (peersRef.current[from]) {
            peersRef.current[from].signal(data);
            return;
          }
          const peer = createPeer(from, socket.id, stream, false);
          peersRef.current[from] = peer;
          peer.signal(data);
        });

        // Participant left
        socket.on('user-left', ({ socketId }) => {
          removePeer(socketId);
        });

      } catch (err) {
        console.error('Failed to get local media', err);
        alert('Unable to access camera/microphone.');
      }
    }

    startLocal();

    function createPeer(userToSignal, callerId, stream, initiator) {
      const peer = new SimplePeer({ initiator, trickle: false, stream });

      peer.on('signal', signal => {
        socket.emit('signal', { to: userToSignal, from: callerId, data: signal });
      });

      peer.on('stream', remoteStream => {
        setRemoteStreams(prev => ({ ...prev, [userToSignal]: remoteStream }));
      });

      peer.on('close', () => removePeer(userToSignal));
      peer.on('error', err => console.warn('Peer error', err));

      return peer;
    }

    function removePeer(id) {
      const peer = peersRef.current[id];
      if (peer) peer.destroy();
      delete peersRef.current[id];
      setRemoteStreams(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }

    return () => {
      try { socket.emit('leave-room', { roomId }); } catch(e) {}
      Object.values(peersRef.current).forEach(p => p.destroy && p.destroy());
      peersRef.current = {};
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      socket.disconnect();
      setRemoteStreams({});
    };

  }, [open, roomId, userName]);

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setIsMuted(prev => !prev);
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(t => t.enabled = !t.enabled);
    setVideoOff(prev => !prev);
  };

  const endCall = () => onClose();

  const RemoteVideo = ({ stream, label }) => {
    const ref = useRef();
    useEffect(() => { if(ref.current){ ref.current.srcObject = stream; ref.current.play().catch(()=>{}); } }, [stream]);
    return (
      <div className="bg-gray-900 rounded overflow-hidden relative">
        <video ref={ref} autoPlay playsInline className="w-full h-full" />
        <div className="absolute left-1 bottom-1 text-xs text-white bg-black/50 px-2 rounded">{label}</div>
      </div>
    );
  };

  return !open ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={endCall}></div>
      <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-3">
            <div className="font-semibold">Call — Room: {roomId}</div>
            {/* <div className="text-sm text-gray-500">You: {userName}</div> */}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="px-3 py-1 rounded bg-gray-100">{isMuted ? 'Unmute' : 'Mute'}</button>
            <button onClick={toggleVideo} className="px-3 py-1 rounded bg-gray-100">{videoOff ? 'Start video' : 'Stop video'}</button>
            <button onClick={endCall} className="px-3 py-1 rounded bg-red-500 text-white">End</button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-1">
            <div className="text-xs text-gray-500 mb-1">You</div>
            <div className="bg-gray-900 rounded overflow-hidden h-48">
              <video ref={localVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Participants</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(remoteStreams).length === 0 && (
                <div className="p-4 bg-gray-50 border rounded text-sm text-gray-500">No other participants yet</div>
              )}
              {Object.entries(remoteStreams).map(([id, stream]) => (
                <RemoteVideo key={id} stream={stream} label={id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}