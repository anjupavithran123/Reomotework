import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:4000';


export default function DocumentEditor({ docId = 'default-doc', username = 'Anonymous' }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]);

  useEffect(() => {
    // initialize Quill editor
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
        ],
      },
    });

    // disable until doc is loaded
    quillRef.current.disable();
    quillRef.current.setText('Loading document...');

    // connect socket
    const socket = io(SERVER_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('connected to server', socket.id);
      socket.emit('join-doc', { docId, username });
    });

    // load initial doc from server
    socket.on('load-doc', (ops) => {
      console.log('load-doc', ops);
      quillRef.current.setContents(ops || []);
      quillRef.current.enable();
    });

    // presence list updated
    socket.on('presence', (users) => {
      setConnectedUsers(users.map(u => u.username));
    });

    // receiving remote delta
    socket.on('receive-delta', (delta) => {
      // apply delta but mark source as 'remote' to avoid echoing it
      quillRef.current.updateContents(delta);
    });

    // send local changes to server
    const handler = (delta, oldDelta, source) => {
      if (source !== 'user') return; // only send user changes
      socket.emit('send-delta', delta);
    };
    quillRef.current.on('text-change', handler);

    // cleanup on unmount
    return () => {
      if (quillRef.current) quillRef.current.off('text-change', handler);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [docId, username]);

  return (
     <div>
   
      <div style={{ border: '1px solid #ccc', borderRadius: 6 }}>
        <div ref={editorRef} style={{ minHeight: 300, padding: 12 }} />
      </div>

     
    </div>
  );
}
