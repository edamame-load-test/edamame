// Get information about tests

import * as dotenv from "dotenv";
import fs from "fs";
import express from "express";
import axios from "axios";
import { fileURLToPath } from "url";
import path from "path";
import { runTest } from "../../../src/commands/runTest.js";
const router = express.Router();
router.use(express.json());

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", async (req, res) => {
  try {
    const { data } = await axios.get(`${process.env.TEMPORARY_DB_API}/tests`);
    res.json(data);
  } catch (error) {
    console.log(`Error getting list of tests dbAPI: ${error}`);
  }
});

router.post("/", async (req, res) => {
  const { title, script } = req.body;
  const filename = "script.js";
  const filePath = path.join(__dirname, filename);
  const scriptString = JSON.stringify(script, null, 2);

  const options = {
    name: title,
    path: filePath,
  };

  fs.writeFile(filePath, scriptString, (error) => {
    if (error) {
      console.error("Error writing the script file:", error);
      res.status(500).send("Error writing the script file");
      return;
    } else {
      console.log(path.join(__dirname, filename));
      runTest(options);
    }
  });
});

export default router;
