import { Schema, model, InferSchemaType } from "mongoose";

export const STATUSES = ["todo", "in_progress", "done"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;

const taskSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    status: { type: String, enum: STATUSES, default: "todo" },
    priority: { type: String, enum: PRIORITIES, default: "medium" },
    category: { type: String, trim: true, default: "General", maxlength: 60 },
    dueDate: { type: Date, default: null },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, status: 1 });

export type TaskDoc = InferSchemaType<typeof taskSchema>;

export const Task = model("Task", taskSchema);