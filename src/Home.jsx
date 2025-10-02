import React, { useState } from "react";
import { FaBars } from "react-icons/fa";


function Home(){

    const[isOpen,setIsOPen]=useState(false);
    const toggleMenu = ()=>{
        setIsOPen(!isOpen);
    };
    return(
   <>
       <header>

        <div className="container">
            
            <nav>
              <div className="logo">
                    <h2>Workspace dashboard</h2>
              </div>
              <ul className={isOpen ? 'nav-link active':"nave-link"}>
                <li>
                    <a href="/members">Members</a>
                </li>

                <li>
                    <a href="/chatbox">ChatBox</a>
                </li>

                <li>
                    <a href="/doc">Docs Editor</a>
                </li>
                <li>
                    <a href="/todolist">Taskboard</a>
                </li>
                <li>
                    <a href="/fileupload">Fileupload</a>
                </li>
              </ul>
           <div className="icon"onClick={toggleMenu}>
           <FaBars />
           </div>

            </nav>
          
        </div>
       </header>
       <section>
        <div className="container">
            <div className="content">
                <h2>responsive</h2>
            </div>
        </div>
       </section>
       </>

    )
}

export default Home;