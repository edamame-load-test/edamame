import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import testRoutes from "./routes/testRoutes.js";
import loadTestRoutes from "./routes/loadTestRoutes.js";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the bundled React app. If there's an index.js it will serve that on "/"
app.use(express.static(path.join(__dirname, "build")));

// API Routes
app.use("/tests", testRoutes);
app.use("/load-test", loadTestRoutes);

app.get("/");

app.listen(3001, () => {
  console.log(`Listening on port 3001`);
});
