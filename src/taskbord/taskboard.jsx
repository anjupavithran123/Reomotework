// TaskBoard.jsx
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import { io } from "socket.io-client";

const SERVER = "http://localhost:4000";
const BOARD_ID = "default-board";

const socket = io(SERVER);

export default function TaskBoard() {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [newTaskContent, setNewTaskContent] = useState({});

  const fetchLists = async () => {
    try {
      const res = await axios.get(`${SERVER}/lists`);
      setLists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLists();

    // join board room (so server can emit only to this room if desired)
    socket.on("connect", () => {
      socket.emit("join-board", { boardId: BOARD_ID });
    });

    socket.on("listsUpdated", fetchLists);
    socket.on("tasksUpdated", fetchLists);
    // also listen to our new event
    socket.on("taskboard-updated", (payload) => {
      // we can optionally handle or ignore here; fetch to update UI
      fetchLists();
    });

    return () => {
      socket.off("listsUpdated", fetchLists);
      socket.off("tasksUpdated", fetchLists);
      socket.off("taskboard-updated");
    };
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId !== destination.droppableId) {
      try {
        await axios.put(`${SERVER}/tasks/${draggableId}`, {
          listId: destination.droppableId,
          boardId: BOARD_ID,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addList = async () => {
    if (!newListTitle) return;
    try {
      await axios.post(`${SERVER}/lists`, { title: newListTitle, boardId: BOARD_ID });
      setNewListTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async (listId) => {
    const content = newTaskContent[listId];
    if (!content) return;

    try {
      await axios.post(`${SERVER}/tasks`, { content, listId, boardId: BOARD_ID });
      setNewTaskContent({ ...newTaskContent, [listId]: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteList = async (listId) => {
    try {
      await axios.delete(`${SERVER}/lists/${listId}`, { data: { boardId: BOARD_ID } });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${SERVER}/tasks/${taskId}`, { data: { boardId: BOARD_ID } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Task Board</h1>

      {/* Add List */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="New List Title"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
        />
        <button onClick={addList}>Add List</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          {lists.map((list) => (
            <Droppable droppableId={list._id} key={list._id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: "#f0f0f0",
                    padding: "10px",
                    borderRadius: "8px",
                    minWidth: "220px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>{list.title}</h3>
                    <button
                      onClick={() => deleteList(list._id)}
                      style={{ background: "gray", color: "white", border: "none", borderRadius: "4px", padding: "2px 6px" }}
                    >
                      Delete
                    </button>
                  </div>

                  {list.tasks.map((task, index) => (
                    <Draggable draggableId={task._id} index={index} key={task._id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px",
                            margin: "5px 0",
                            background: "#fff",
                            borderRadius: "4px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <span>{task.content}</span>
                          <button
                            onClick={() => deleteTask(task._id)}
                            style={{ background: "gray", color: "white", border: "none", borderRadius: "4px", padding: "2px 6px" }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Add Task */}
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="text"
                      placeholder="New Task"
                      value={newTaskContent[list._id] || ""}
                      onChange={(e) => setNewTaskContent({ ...newTaskContent, [list._id]: e.target.value })}
                    />
                    <button onClick={() => addTask(list._id)}>Add Task</button>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
