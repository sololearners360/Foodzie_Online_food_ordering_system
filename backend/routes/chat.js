
import express from "express";
import { chat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", chat); // POST /api/chat

export default router;
