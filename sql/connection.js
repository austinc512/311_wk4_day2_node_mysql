const mysql = require("mysql");
require("dotenv").config();

//class based connection
// class Connection {
//   constructor() {
//     if (!this.pool) {
//       console.log("creating connection...");
//       this.pool = mysql.createPool({
//         connectionLimit: 100,
//         host: process.env.HOST,
//         user: process.env.USER,
//         password: process.env.PASSWORD,
//         database: process.env.DATABASE,
//         // port: process.env.PORT
//       });

//       return this.pool;
//     }

//     return this.pool;
//   }
// }

// const instance = new Connection();

// module.exports = instance;

// this is the thing that f***ed it up:
// console.log(process.env.USER);

// defined connection
let connection = mysql.createConnection({
  // connectionLimit: 100,
  host: process.env.DB_HOST,
  //reference line 30
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

connection.connect();

// let sql = "select now()";
// let callback = (err, rows) => {
//   if (err) {
//     console.log(`could not connect to database `, err);
//   } else {
//     console.log(`connection made`, rows);
//   }
// };

// async query
connection.query("select now()", (err, rows) => {
  if (err) {
    console.log("connection not successful", err);
  } else {
    "connection successful", rows;
  }
});

// make connection

module.exports = connection;

// make a note: previous project that had a public folder?
