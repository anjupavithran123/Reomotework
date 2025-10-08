import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function TaskBoard() {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [newTaskContent, setNewTaskContent] = useState({});

  const fetchLists = async () => {
    try {
      const res = await axios.get("http://localhost:4000/lists");
      setLists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLists();
    socket.on("listsUpdated", fetchLists);
    socket.on("tasksUpdated", fetchLists);

    return () => {
      socket.off("listsUpdated");
      socket.off("tasksUpdated");
    };
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId !== destination.droppableId) {
      try {
        await axios.put(`http://localhost:4000/tasks/${draggableId}`, {
          listId: destination.droppableId,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addList = async () => {
    if (!newListTitle) return;
    try {
      await axios.post("http://localhost:4000/lists", { title: newListTitle });
      setNewListTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async (listId) => {
    const content = newTaskContent[listId];
    if (!content) return;

    try {
      await axios.post("http://localhost:4000/tasks", { content, listId });
      setNewTaskContent({ ...newTaskContent, [listId]: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteList = async (listId) => {
    try {
      await axios.delete(`http://localhost:4000/lists/${listId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:4000/tasks/${taskId}`);
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
                      onChange={(e) =>
                        setNewTaskContent({ ...newTaskContent, [list._id]: e.target.value })
                      }
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
