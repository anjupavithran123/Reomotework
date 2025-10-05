
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import io from 'socket.io-client';
import './whiteboard.css'

// Update this to match your server address
const SOCKET_URL = import.meta.env.REACT_APP_SOCKET_URL || 'http://localhost:4001';

export default function CollaborativeWhiteboard({ width = 1200, height = 700 }) {
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const socketRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]); // history of lines
  const currentLineRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);

  // local undo stack is simply derived from lines; for collaboration we use server-side undo

  useEffect(() => {
    // connect socket once
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('socket connected', socket.id);
      socket.emit('requestSync');
    });

    socket.on('syncState', (state) => {
      // state.lines expected
      if (state && Array.isArray(state.lines)) setLines(state.lines);
    });

    socket.on('draw', (line) => {
      // append remote line
      setLines((prev) => [...prev, line]);
    });

    socket.on('clear', () => setLines([]));

    socket.on('undo', () => setLines((prev) => prev.slice(0, -1)));

    return () => {
      socket.disconnect();
    };
  }, []);

  // helpers
  function getPointerPos() {
    const stage = stageRef.current;
    return stage ? stage.getPointerPosition() : null;
  }

  function handleMouseDown(e) {
    const pos = getPointerPos();
    if (!pos) return;
    setIsDrawing(true);
    const newLine = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      points: [pos.x, pos.y],
      strokeWidth: 3,
      stroke: strokeColor,
      lineCap: 'round',
      lineJoin: 'round',
      // optional meta: author, color, etc.
      meta: { client: socketRef.current?.id || 'local' },
    };
    currentLineRef.current = newLine;
    // optimistically render
    setLines((prev) => [...prev, newLine]);
  }

  function handleMouseMove() {
    if (!isDrawing) return;
    const pos = getPointerPos();
    if (!pos) return;

    // append two numbers to the line.points
    currentLineRef.current.points = currentLineRef.current.points.concat([pos.x, pos.y]);

    // update the last line in state
    setLines((prev) => {
      const copy = prev.slice();
      copy[copy.length - 1] = { ...currentLineRef.current };
      return copy;
    });
  }

  function handleMouseUp() {
    if (!isDrawing) return;
    setIsDrawing(false);
    const finishedLine = currentLineRef.current;
    currentLineRef.current = null;

    // send to server
    if (socketRef.current && finishedLine) {
      socketRef.current.emit('draw', finishedLine);
    }
  }

  function clearBoard() {
    setLines([]);
    socketRef.current?.emit('clear');
  }

  function undo() {
    // local optimistic undo
    setLines((prev) => prev.slice(0, -1));
    socketRef.current?.emit('undo');
  }

  function exportImage() {
    const stage = stageRef.current;
    if (!stage) return;
    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    // trigger download
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `whiteboard-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <div className="w-full flex items-center justify-between">
        <div className="space-x-2">
          <button
            onClick={undo}
            className="px-3 py-2 rounded-lg shadow-sm border hover:brightness-95"
            title="Undo last stroke"
          >
            Undo
          </button>

          <button
            onClick={clearBoard}
            className="px-3 py-2 rounded-lg shadow-sm border hover:brightness-95"
            title="Clear board for everyone"
          >
            Clear
          </button>

          <button
            onClick={exportImage}
            className="px-3 py-2 rounded-lg shadow-sm border hover:brightness-95"
            title="Export as PNG"
          >
            Export PNG
          </button>

          {/* Color picker + size */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
            <span style={{ fontSize: 13 }}>Color</span>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              title="Select stroke color"
              style={{ width: 36, height: 36, padding: 0, border: 'none', background: 'transparent' }}
            />
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
            <span style={{ fontSize: 13 }}>Size</span>
            <input
              type="range"
              min={1}
              max={30}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              title="Stroke width"
              style={{ verticalAlign: 'middle' }}
            />
          </label>
        </div>
        <div className="text-sm text-white">Connected: {socketRef.current?.connected ? 'Yes' : 'No'}</div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white" style={{ width, height }}>
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          style={{ touchAction: 'none' }}
        >
          <Layer ref={layerRef}>
            {lines.map((ln) => (
              <Line
                key={ln.id}
                points={ln.points}
                stroke={ln.stroke}
                strokeWidth={ln.strokeWidth}
                lineCap={ln.lineCap}
                lineJoin={ln.lineJoin}
                tension={0.5}
                listening={false}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <div className="text-xs text-gray-500">Tip: Open the app in multiple browser windows to test collaboration.</div>
    </div>
  );
}
