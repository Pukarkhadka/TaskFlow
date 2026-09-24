import { Response } from "express";
import { Task, STATUSES } from "../models/Task";
import { AuthRequest, asyncHandler, toObjectId } from "../utils/helpers";

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = toObjectId(req.userId as string);

  const [total, statusGroups, priorityGroups, categoryGroups, overdueCount] = await Promise.all([
    Task.countDocuments({ user: userId }),
    Task.aggregate<{ _id: string; count: number }>([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Task.aggregate<{ _id: string; count: number }>([
      { $match: { user: userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    Task.aggregate<{ _id: string; count: number }>([
      { $match: { user: userId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
    Task.countDocuments({ user: userId, status: { $ne: "done" }, dueDate: { $lt: new Date() } }),
  ]);

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  statusGroups.forEach((g) => {
    byStatus[g._id] = g.count;
  });

  const byPriority = { low: 0, medium: 0, high: 0 };
  priorityGroups.forEach((g) => {
    byPriority[g._id as keyof typeof byPriority] = g.count;
  });

  const categoryGroupsSorted = categoryGroups
    .map((g) => ({ name: g._id || "General", count: g.count }))
    .sort((a, b) => b.count - a.count);

  const completed = byStatus.done;
  const pending = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const perDay = await Task.aggregate<{
    _id: string;
    date: string;
    doneCount: number;
    inProgressCount: number;
    createdCount: number;
  }>([
    { $match: { user: userId, updatedAt: { $gte: daysAgo(7) } } },
    {
      $project: {
        status: 1,
        date: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
      },
    },
    {
      $group: {
        _id: "$date",
        doneCount: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
        inProgressCount: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
        createdCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    total,
    completed,
    pending,
    completionRate,
    overdue: overdueCount,
    byStatus,
    byPriority,
    byCategory: categoryGroupsSorted,
    tasksPerDay: perDay.map((d) => ({ date: d._id, done: d.doneCount, created: d.createdCount, inProgress: d.inProgressCount })),
  });
});

const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};