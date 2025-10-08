import React, { useState,useEffect } from "react";
import { FaBars } from "react-icons/fa";

import axios from "axios";

import ProfilepicUpload from "./profilepic";

function Home(){


    const[isOpen,setIsOPen]=useState(false);
    const toggleMenu = ()=>{
        setIsOPen(!isOpen);
    };



    const [profilePic, setProfilePic] = useState(null);
    useEffect(() => {
        // Example: fetch last uploaded profile pic
        axios.get("http://localhost:4000/user-profile").then((res) => {
          if (res.data.filename) {
            setProfilePic(`http://localhost:4000/uploads/${res.data.filename}`);
          }
        });
    }, []);



    return(
   <>
       <header>
       <div className="logo">
                    <h2>Workspace dashboard</h2>
              </div>
        <div className="container">
           

            <nav>
             <br />
              <div>
              <h2>Anju MP</h2>
              <ProfilepicUpload/>
              </div>
              
              <ul className={isOpen ? 'nav-link active':"nave-link"}>
                <li>
                    <a href="/members">Members</a>
                </li>

                <li>
                    <a href="/chatcontainer">ChatBox</a>
                </li>

                <li>
                    <a href="/document">Docs Editor</a>
                </li>
                <li>
                    <a href="/taskboard">Taskboard</a>
                </li>
                <li>
                    <a href="/fileupload">Fileupload</a>
                </li>
              <li>
                    <a href="/whiteboard">White-Board</a>
                </li> 
              </ul>
           <div className="icon"onClick={toggleMenu}>
           <FaBars />
           </div>

            </nav>
          
        </div>
       </header>
       {/* <section>
        <div className="container">
            <div className="content">
                <h2>responsive</h2>
            </div>
        </div>
       </section> */}
       </>

    )
}

export default Home;