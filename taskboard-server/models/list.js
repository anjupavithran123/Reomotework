import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  completed: { type: Boolean, default: false },
});

const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tasks: [TaskSchema],
});

export default mongoose.model("List", ListSchema);
