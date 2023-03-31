// Get information about tests

import * as dotenv from "dotenv";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { runTest } from "../../../src/commands/runTest.js";
import { deleteTest } from "../../../src/commands/deleteTest.js";
import { stopTest } from "../../../src/commands/stopTest.js";
import { destroyEKSCluster } from "../../../src/commands/destroy.js";
import dbApi from "../../../src/utilities/dbApi.js";
import { NUM_VUS_PER_POD } from "../../../src/constants/constants.js";
const router = express.Router();
router.use(express.json());

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", async (req, res) => {
  try {
    const data = await dbApi.getAllTests();
    res.json(data);
  } catch (error) {
    console.log(`Error getting list of tests dbAPI: ${error}`);
  }
});

router.post("/", async (req, res) => {
  const { title, script } = req.body;
  const filename = "script.js";
  const filePath = path.join(__dirname, filename);
  const scriptString = script;

  const options = {
    name: title,
    file: filePath,
    vusPerPod: NUM_VUS_PER_POD,
  };

  fs.writeFile(filePath, scriptString, (error) => {
    if (error) {
      console.error("Error writing the script file:", error);
      res.status(500).send("Error writing the script file");
      return;
    } else {
      runTest(options);
    }
  });
});

router.delete("/:name", async (req, res) => {
  const name = req.params.name;
  deleteTest(name);
});

router.post("/stop", (req, res) => {
  stopTest();
  res.status(200).json({ message: "Load test stopped successfully" });
});

router.post("/teardown", (req, res) => {
  destroyEKSCluster();
});

router.get("/:name", async (req, res) => {
  const name = req.params.name;
  const data = await dbApi.getTest(name);
  res.status(200).json(data);
});

export default router;
