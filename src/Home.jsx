// Home.jsx
import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import axios from "axios";
import ProfilepicUpload from "./profilepic";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

const SERVER_URL = "http://localhost:4001"; // for doc/taskboard
const CHAT_SERVER_URL = "http://localhost:3002"; // new
const WATCH_DOC_ID = "default-doc";
const WATCH_BOARD_ID = "default-board";

function Home() {
  const [isOpen, setIsOPen] = useState(false);
  const toggleMenu = () => setIsOPen(!isOpen);

  const [profilePic, setProfilePic] = useState(null);
  const [docNotifications, setDocNotifications] = useState({});
  const [taskboardNotifications, setTaskboardNotifications] = useState({});
  const [chatNotifications, setChatNotifications] = useState(0);
  const [socketStatus, setSocketStatus] = useState("disconnected");

  // new: user state read from localStorage (saved by your Login component)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse user from localStorage", e);
      return null;
    }
  });

  useEffect(() => {
    // if you later set avatar/filename in user object you can prefer it
    // otherwise existing GET /user-profile will set profilePic if available
    if (user?.avatar) {
      setProfilePic(user.avatar);
    }

    // Try to fetch server profile (keeps your previous behavior)
    axios
      .get("http://localhost:4000/user-profile")
      .then((res) => {
        if (res.data?.filename) {
          setProfilePic(`http://localhost:4000/uploads/${res.data.filename}`);
        }
      })
      .catch(() => {});
  }, [user]);

  // 🔹 Connect to main workspace socket
  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Home connected to socket", socket.id);
      setSocketStatus("connected");

      // join rooms as before
      socket.emit("join-doc", { docId: WATCH_DOC_ID, username: "home-notifier" });
      socket.emit("join-board", { boardId: WATCH_BOARD_ID });

      // new: let server know which user is online (if we have user id)
      if (user && user.id) {
        socket.emit("user-online", user.id);
      }
    });

    socket.on("connect_error", (err) => setSocketStatus("connect_error"));
    socket.on("disconnect", () => setSocketStatus("disconnected"));

    socket.on("doc-updated", ({ docId }) =>
      setDocNotifications((prev) => ({ ...prev, [docId]: (prev[docId] || 0) + 1 }))
    );

    socket.on("taskboard-updated", (payload) => {
      const boardId = payload?.boardId || WATCH_BOARD_ID;
      setTaskboardNotifications((prev) => ({ ...prev, [boardId]: (prev[boardId] || 0) + 1 }));
    });

    return () => socket.disconnect();
    // include `user` as dependency so user-online can be emitted if user loads later
  }, [user]);

  // 🔹 Connect to CHAT SERVER for new messages
  useEffect(() => {
    const chatSocket = io(CHAT_SERVER_URL, { autoConnect: true });

    chatSocket.on("connect", () => console.log("Connected to chat server"));
    chatSocket.on("message", (msg) => {
      console.log("New chat message:", msg);
      setChatNotifications((count) => count + 1); // increase badge count
    });

    return () => chatSocket.disconnect();
  }, []);

  const handleDocsClick = () =>
    setDocNotifications((prev) => ({ ...prev, [WATCH_DOC_ID]: 0 }));

  const handleTaskboardClick = () =>
    setTaskboardNotifications((prev) => ({ ...prev, [WATCH_BOARD_ID]: 0 }));

  const handleChatClick = () => setChatNotifications(0); // 🆕

  const docsBadgeCount = docNotifications[WATCH_DOC_ID] || 0;
  const taskboardBadgeCount = taskboardNotifications[WATCH_BOARD_ID] || 0;

  // display name fallback
  const displayName = user?.name || "Anonymous";

  return (
    <>
      <style>{`
        .nave-link { display:flex; flex-direction:column; gap:8px; padding:0; }
        .badge { display:inline-block; min-width:18px; padding:2px 6px; font-size:12px; border-radius:12px; background:#e11d48; color:white; margin-left:8px; }
        .docs-link { display:inline-flex; align-items:center; gap:6px; }
        .status { font-size:12px; margin-left:12px; color:#666; }
        .profile-img { width:40px; height:40px; border-radius:50%; object-fit:cover; margin-left:8px; }
      `}</style>

      <header>
        <div className="logo"><h2>Workspace dashboard</h2></div>
        <div className="container">
          <nav>

              <div>
                <h2>{displayName}</h2>
            

              {/* show profile pic if available, else render ProfilepicUpload component */}
              {profilePic ? (
                <img src={profilePic} alt="profile" className="profile-img" />
              ) : (
                <ProfilepicUpload />
              )}
            </div>

            <ul className={isOpen ? "nav-link active" : "nave-link"}>
            <li><Link to="/members">Members</Link></li>
              <li>
                 <Link to="/chatcontainer" onClick={handleChatClick} className="docs-link">
                  ChatBox
                  {chatNotifications > 0 && <span className="badge">{chatNotifications}</span>}
                </Link>
              </li>

              <li>
                <Link to="/document" onClick={handleDocsClick} className="docs-link">
                  Docs Editor
                  {docsBadgeCount > 0 && <span className="badge">{docsBadgeCount}</span>}
                  </Link>
              </li>

              <li>
                <Link to="/taskboard" onClick={handleTaskboardClick} className="docs-link">
                  Taskboard
                  {taskboardBadgeCount > 0 && <span className="badge">{taskboardBadgeCount}</span>}
                  </Link>
              </li>

                  <li><Link to="/fileupload">Fileupload</Link></li>/
                  <li><Link to="/whiteboard">White-Board</Link></li>
                  <li><Link to="/email">Invite email</Link></li>
                  <li><Link to="/videocall">Video-Chat</Link></li>
            </ul>

            <div className="icon" onClick={toggleMenu}><FaBars /></div>
          </nav>
        </div>
      </header>
    </>
  );
}

export default Home;
