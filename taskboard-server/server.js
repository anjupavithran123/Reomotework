import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/taskboard", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// CRUD APIs
// Lists
app.get("/lists", async (req, res) => {
  const lists = await List.find().populate("tasks");
  res.json(lists);
});

app.post("/lists", async (req, res) => {
  const list = await List.create({ title: req.body.title, tasks: [] });
  io.emit("listsUpdated"); // real-time sync
  res.json(list);
});

app.put("/lists/:id", async (req, res) => {
  const list = await List.findByIdAndUpdate(req.params.id, req.body, { new: true });
  io.emit("listsUpdated");
  res.json(list);
});

app.delete("/lists/:id", async (req, res) => {
  await List.findByIdAndDelete(req.params.id);
  io.emit("listsUpdated");
  res.json({ success: true });
});

// Tasks
app.post("/tasks", async (req, res) => {
  const task = await Task.create(req.body);
  const list = await List.findById(req.body.listId);
  list.tasks.push(task._id);
  await list.save();
  io.emit("tasksUpdated");
  res.json(task);
});

app.put("/tasks/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  io.emit("tasksUpdated");
  res.json(task);
});

app.delete("/tasks/:id", async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  await List.findByIdAndUpdate(task.listId, { $pull: { tasks: task._id } });
  io.emit("tasksUpdated");
  res.json({ success: true });
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

server.listen(4000, () => console.log("Server running on port 4000"));
