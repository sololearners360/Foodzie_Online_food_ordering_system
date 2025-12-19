
import express from "express";
import { chat, kuddusChat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", chat); // POST /api/chat
router.post("/kuddus", kuddusChat); // POST /api/chat/kuddus

export default router;
