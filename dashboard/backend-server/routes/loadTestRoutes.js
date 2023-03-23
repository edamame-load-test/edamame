import express from "express";
const router = express.Router();
import { stopTest } from "../../../src/commands/stopTest.js";

router.post("/stop", (req, res) => {
  stopTest();
  res.status(200).json({ message: "Load test stopped successfully" });
});

export default router;
