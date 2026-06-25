import "./config/env.js";
import app from "./app.js";

const serverPort = process.env.PORT || 3000;

app.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
});
