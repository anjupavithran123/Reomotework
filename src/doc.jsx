import { useEffect, useRef, useState } from "react";
import Delta from "quill-delta";

import { AddUser } from "./components/AddUser";
import { User } from "./components/User";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";




import "./doc.css";

function Document() {
  // Server state
  const [users, setUsers] = useState(["Peter", "Stewie"]);
  const [operations, setOperations] = useState([]);

  // Frequently updated and not depended for any state to update
  const contentRef = useRef(new Delta());

  // Effects
  // Update Server state
  useEffect(() => {
    if (operations.length) {
      const newcontent = operations.reduce((acc, curr) => {
        return acc.compose(curr.delta);
      }, contentRef.current);
  
      contentRef.current = newcontent;
      console.log("server updated...");
  
      // ✅ Show notification
      toast.info("Document content has been updated!", {
        position: "bottom-right",
        autoClose: 3000, // close after 3s
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
  
      setOperations([]);
    }
  }, [operations]);
  
  // API mock
  const getInitialState = () => {
    return contentRef.current;
  };

  // Handlers
  const onCreateUser = (username) => {
    if (users.includes(username)) {
      const message = `There's already an user with name "${username}". Try a different name`;
      alert(message);
      return;
    }

    setUsers((pre) => [username, ...pre]);
  };

  return (
    <>
      <div className="container">
        <h1 className="center">Document Editor</h1>
        <AddUser onCreateUser={onCreateUser} />
        <div className="users">
          {users.map((user) => (
            <User
              key={user}
              name={user}
              operations={operations}
              setOperations={setOperations}
              getInitialState={getInitialState}
            />
          ))}
        </div>
      </div>
  
      {/* ✅ Toast container must be here */}
      <ToastContainer />
    </>
  );
  
}

export default Document;
