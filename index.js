const express = require("express");
const usersRouter = require("./routers/users");

const app = express();

app.use(express.json());

app.use(express.static("public"));

const port = 5003;

app.use("/users", usersRouter);

// the public folder displays without this
// app.get("/", (req, res) => {
//   res.send("Welcome to our server!");
// });

app.listen(port, () => {
  console.log(`Web server is listening on port ${port}!`);
});

// const pool = require('./sql/connection');

// const test = pool.query('SELECT * FROM users', (err, rows) => {
//   if (err) {
//     console.log({ 'message': 'Error occurred: ' + err })
//   } else {
//     console.log(rows);
//   }
// });

// console.log(test);
