import { Response } from "express";
import { Task, STATUSES, PRIORITIES } from "../models/Task";
import { AuthRequest, asyncHandler, isValidObjectId, toObjectId } from "../utils/helpers";

const priorityRank: Record<string, number> = { low: 0, medium: 1, high: 2 };

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, priority, category, search, sort = "createdAt", order = "desc" } = req.query as Record<string, string | undefined>;

  const filter: {
    user: ReturnType<typeof toObjectId>;
    status?: string;
    priority?: string;
    category?: { $regex: string; $options: string };
    $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  } = { user: toObjectId(req.userId as string) };

  if (status && (STATUSES as readonly string[]).includes(status)) filter.status = status;
  if (priority && (PRIORITIES as readonly string[]).includes(priority)) filter.priority = priority;
  if (category) filter.category = { $regex: category, $options: "i" };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  const sortField = ["createdAt", "dueDate", "priority", "title"].includes(sort) ? sort : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  const sortQuery: Record<string, 1 | -1> = {
    [sortField]: sortOrder,
    _id: -1,
  };

  const tasks = await Task.find(filter).sort(sortQuery);

  const payload = tasks.map((t) => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    category: t.category,
    dueDate: t.dueDate,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  if (sortField === "priority") {
    const rank = sortOrder === 1 ? priorityRank : Object.fromEntries(Object.entries(priorityRank).reverse());
    payload.sort((a, b) => rank[a.priority] - rank[b.priority]);
  }

  res.json(payload);
});

export const getTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid id format" });
    return;
  }

  const task = await Task.findOne({ _id: id, user: req.userId });
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.json({ id: task._id.toString(), title: task.title, description: task.description, status: task.status, priority: task.priority, category: task.category, dueDate: task.dueDate, createdAt: task.createdAt, updatedAt: task.updatedAt });
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, status, priority, category, dueDate } = req.body as Record<string, unknown>;

  if (!title || typeof title !== "string" || !title.trim()) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  const task = await Task.create({
    title: title.trim(),
    description: typeof description === "string" ? description : "",
    status: (STATUSES as readonly string[]).includes(status as string) ? status : "todo",
    priority: (PRIORITIES as readonly string[]).includes(priority as string) ? priority : "medium",
    category: typeof category === "string" && category.trim() ? category.trim() : "General",
    dueDate: dueDate ? new Date(dueDate as string) : null,
    user: req.userId,
  });

  res.status(201).json({
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  });
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid id format" });
    return;
  }

  const task = await Task.findOne({ _id: id, user: req.userId });
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const body = req.body as Record<string, unknown>;

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      res.status(400).json({ message: "Title cannot be empty" });
      return;
    }
    task.title = body.title.trim();
  }
  if (body.description !== undefined) task.description = String(body.description);
  if (body.status !== undefined) {
    if (!(STATUSES as readonly string[]).includes(body.status as string)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    task.status = body.status as (typeof STATUSES)[number];
  }
  if (body.priority !== undefined) {
    if (!(PRIORITIES as readonly string[]).includes(body.priority as string)) {
      res.status(400).json({ message: "Invalid priority" });
      return;
    }
    task.priority = body.priority as (typeof PRIORITIES)[number];
  }
  if (body.category !== undefined) {
    task.category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : "General";
  }
  if (body.dueDate !== undefined) {
    task.dueDate = body.dueDate ? new Date(body.dueDate as string) : null;
  }

  await task.save();

  res.json({ id: task._id.toString(), title: task.title, description: task.description, status: task.status, priority: task.priority, category: task.category, dueDate: task.dueDate, createdAt: task.createdAt, updatedAt: task.updatedAt });
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid id format" });
    return;
  }

  const task = await Task.findOne({ _id: id, user: req.userId });
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  await task.deleteOne();
  res.json({ message: "Task deleted" });
});