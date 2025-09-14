const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
const app = require("./app");

const DB = process.env.DB.replace("<PASSWORD>", process.env.DB_PASSWORD);

mongoose
  .connect(DB, {})
  .then(() => console.log("MongoDB connected successfully ✅"));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is running on port ${port} ✅`);
});
