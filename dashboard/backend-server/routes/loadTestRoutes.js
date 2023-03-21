import express from "express";
const router = express.Router();

router.post("/start", (req, res) => {
  // Retrieves the file in the body, saves it somewhere temporarily, and starts the test
});

router.post("/stop", (req, res) => {
  // Stop the load test
});

export default router;
