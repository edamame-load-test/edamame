import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import testRoutes from "./routes/testRoutes.js";
import clusterRoutes from "./routes/clusterRoutes.js";
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the bundled React app. If there's an index.js it will serve that on "/"
app.use(express.static(path.join(__dirname, "build")));

// API Routes
app.use("/tests", testRoutes);
app.use("/cluster", clusterRoutes);

// Fallback to the React app for any other route
app.get("/");

app.listen(3001, () => {
  console.log(`Listening on port 3001`);
});
