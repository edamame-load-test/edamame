import express from "express";
const app = express();
const path = require("path");
const testRoutes = require("./routes/testRoutes");
const loadTestRoutes = require("./routes/loadTestRoutes");
// app.use(express.json());

// Serve the bundled React app. If there's an index.js it will serve that on "/"
app.use(express.static(path.join(__dirname, "build")));
app.use("/tests", testRoutes);
app.use("/load-test", loadTestRoutes);

// app.post("/run", (req, res) => {
//   const data = req.body;
//   runTest();
// });

/*
  /tests
  /actions
    /actions/run
    /actions/stop
  /

  app.get("/"): Serves the react app
  app.get("/tests") Gives you tests
  app.post("/actions/run")
  app.post("/actions/stop")

*/

app.get("/");

app.listen(3001, () => {
  console.log(`Listening on port ${PORT}`);
});
