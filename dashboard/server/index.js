import app from "./app.js";
import portForward from "./portForward.js"

app.listen(4000, () =>
  console.log(`Example app listening on port ${4000}!`),
);

portForward.listen(4444);