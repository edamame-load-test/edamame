const express = require("express");
const router = express.Router();

router.post("/start", (req, res) => {
  // Start the load test
});

router.post("/stop", (req, res) => {
  // Stop the load test
});

module.exports = router;
