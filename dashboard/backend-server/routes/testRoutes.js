// Get information about tests

import * as dotenv from "dotenv";
import express from "express";
import axios from "axios";
const router = express.Router();

dotenv.config();

router.get("/", async (req, res) => {
  try {
    const { data } = await axios.get(`${process.env.TEMPORARY_DB_API}/tests`);
    res.json(data);
  } catch (error) {
    console.log(`Error getting list of tests dbAPI: ${error}`);
  }
});

export default router;
