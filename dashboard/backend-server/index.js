import express from "express";
import dbApi from "../../src/utilities/dbApi";
import runTest from "../../src/commands/runTest";
const app = express();
app.use(express.json());

// app.post("/run", (req, res) => {
//   const data = req.body;
//   runTest();
// });

app.listen(3001, () => {
  console.log(`Listening on port ${PORT}`);
});
