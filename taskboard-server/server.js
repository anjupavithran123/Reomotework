// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

// ===== MongoDB =====
mongoose.connect("mongodb://127.0.0.1:27017/taskboard", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ===== Schemas & Models =====
const ListSchema = new mongoose.Schema({
  title: String,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

const TaskSchema = new mongoose.Schema({
  content: String,
  listId: { type: mongoose.Schema.Types.ObjectId, ref: "List" },
  order: Number,
});

const List = mongoose.model("List", ListSchema);
const Task = mongoose.model("Task", TaskSchema);

// ===== App & Socket.IO =====
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// Helper: emit taskboard update (room + global fallback)
function emitTaskboardUpdate(payload = {}) {
  const boardId = payload.boardId || "default-board";
  // Emit to specific room
  io.to(boardId).emit("taskboard-updated", payload);
  // Also emit globally as fallback so components that didn't join still hear it
  io.emit("taskboard-updated", payload);
}

// ===== CRUD APIs =====

// Get lists (populated)
app.get("/lists", async (req, res) => {
  try {
    const lists = await List.find().populate("tasks").lean();
    res.json(lists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch lists" });
  }
});

// Create list
app.post("/lists", async (req, res) => {
  try {
    const { title, boardId } = req.body;
    const list = await List.create({ title, tasks: [] });
    emitTaskboardUpdate({
      boardId: boardId || "default-board",
      type: "list:create",
      listId: list._id,
      timestamp: Date.now(),
    });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create list" });
  }
});

// Update list
app.put("/lists/:id", async (req, res) => {
  try {
    const { boardId, ...payload } = req.body;
    const list = await List.findByIdAndUpdate(req.params.id, payload, { new: true }).populate("tasks");
    emitTaskboardUpdate({
      boardId: boardId || "default-board",
      type: "list:update",
      listId: list._id,
      timestamp: Date.now(),
    });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to update list" });
  }
});

// Delete list
app.delete("/lists/:id", async (req, res) => {
  try {
    // boardId can come via body or query
    const boardId = req.body?.boardId || req.query?.boardId || "default-board";
    await List.findByIdAndDelete(req.params.id);
    emitTaskboardUpdate({
      boardId,
      type: "list:delete",
      listId: req.params.id,
      timestamp: Date.now(),
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete list" });
  }
});

// Create task
app.post("/tasks", async (req, res) => {
  try {
    const { content, listId, order, boardId } = req.body;
    const task = await Task.create({ content, listId, order });
    const list = await List.findById(listId);
    if (list) {
      list.tasks.push(task._id);
      await list.save();
    }
    emitTaskboardUpdate({
      boardId: boardId || "default-board",
      type: "task:create",
      taskId: task._id,
      listId,
      timestamp: Date.now(),
    });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create task" });
  }
});

// Update task
app.put("/tasks/:id", async (req, res) => {
  try {
    const { boardId, ...payload } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, payload, { new: true });
    emitTaskboardUpdate({
      boardId: boardId || "default-board",
      type: "task:update",
      taskId: task._id,
      listId: payload.listId || task.listId,
      timestamp: Date.now(),
    });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to update task" });
  }
});

// Delete task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const boardId = req.body?.boardId || req.query?.boardId || "default-board";
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) {
      await List.findByIdAndUpdate(task.listId, { $pull: { tasks: task._id } });
      emitTaskboardUpdate({
        boardId,
        type: "task:delete",
        taskId: task._id,
        listId: task.listId,
        timestamp: Date.now(),
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete task" });
  }
});

// ===== Socket.IO connection handling =====
io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  // join a board room
  socket.on("join-board", ({ boardId }) => {
    if (boardId) {
      socket.join(boardId);
      console.log(`${socket.id} joined board ${boardId}`);
    }
  });

  socket.on("leave-board", ({ boardId }) => {
    if (boardId) {
      socket.leave(boardId);
      console.log(`${socket.id} left board ${boardId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

// ===== Start server =====
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
