

import React, { useState } from 'react';
import CallPopup from './callpopup';


export default function VideoCall(){
const [open, setOpen] = useState(false);

const roomId = 'workspace-42';



return (
<div className="p-6">
<h1 className="text-xl font-bold">Video-Chat</h1>
<p className="mb-4">Room: {roomId}</p>
<button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Start Call</button>


<CallPopup roomId={roomId}  open={open} onClose={() => setOpen(false)} />
</div>
);
}