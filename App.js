const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: ".env" });
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
const port = process.env.PORT || 5000;

app.use(cors());
app.options("*", cors());

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

//routes
const api = process.env.API_URL;
const usersRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const likeRoutes = require("./routes/likes");
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/posts`, postRoutes);
app.use(`${api}/comments`, commentRoutes);
app.use(`${api}/likes`, likeRoutes);
//datBase
mongoose
  .connect(process.env.CONNECTION_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "BigFan",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log("server is running http://localhost:" + port);
});
