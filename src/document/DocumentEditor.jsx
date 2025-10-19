import { DOCUMENT_URL } from '../config';
import { io } from 'socket.io-client';

export default function DocumentEditor({ docId = 'default-doc', username = 'Anonymous' }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]);

  useEffect(() => {
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      modules: { toolbar: [['bold', 'italic'], ['link', 'image']] },
    });

    quillRef.current.disable();
    quillRef.current.setText('Loading document...');

    // ⚡ Use DOCUMENT_URL from config
    const socket = io(DOCUMENT_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('connected to server', socket.id);
      socket.emit('join-doc', { docId, username });
    });

    socket.on('load-doc', (ops) => {
      quillRef.current.setContents(ops || []);
      quillRef.current.enable();
    });

    socket.on('presence', (users) => {
      setConnectedUsers(users.map(u => u.username));
    });

    socket.on('receive-delta', (delta) => {
      quillRef.current.updateContents(delta);
    });

    const handler = (delta, oldDelta, source) => {
      if (source !== 'user') return;
      socket.emit('send-delta', delta);
    };

    quillRef.current.on('text-change', handler);

    return () => {
      quillRef.current.off('text-change', handler);
      socketRef.current.disconnect();
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
