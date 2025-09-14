const express = require("express");
const userRouter = require("./routes/userRoutes");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/users", userRouter);

module.exports = app;
