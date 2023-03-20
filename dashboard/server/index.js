import app from "./app.js";
import portForward from "./portForward.js"

app.listen(3000, () =>
  console.log(`Example app listening on port ${3000}!`),
);

portForward.listen(3001);