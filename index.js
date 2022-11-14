const express = require("express");
const router = express.Router();
const cors = require("cors");
const app = express();

//Made Modules
const usersRoute = require("./routes/usersRoute");


app.set("port", process.env.PORT || 3306);

//The use of modules
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-*", "*");
  next();
});

app.use(
  cors({
    mode: "no-cors",
    origin: ["http://localhost:8080/", "http://127.0.0.1:8080"],
    credentials: true,
  })
);

app.use(
    router,
    usersRoute,
    express.json(),
    express.urlencoded({
      extended: true,
    })
  );

  //Listening for the Server
  app.listen(app.get("port"), (req, res) => {
    console.log("Connection to server has been established");
    console.log(`Access port at localhost:${app.get("port")}`);
    console.log("Press Ctrl + C to cut connection to the server.");
  });