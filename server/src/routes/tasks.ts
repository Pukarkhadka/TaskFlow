import { Router } from "express";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { getStats } from "../controllers/statsController";
import { auth } from "../middleware/auth";

const router = Router();

router.use(auth);

router.get("/stats", getStats);
router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;