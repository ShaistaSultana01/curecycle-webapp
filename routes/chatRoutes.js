import express from "express";
import { chatBot } from "../controllers/chatController.js";

const router = express.Router();

// POST /api/chat
router.post("/", chatBot);

export default router;