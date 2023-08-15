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

// mysql module doesn't inslude a method that handles promises, only callbacks
// it's only concerned with making queries, not async handling
// if we want to use promises, you could probably find a module that handles mysql promises (and learn to use it)
// OR we can build our own middleware functions that does it for us.

// basic wrapper prmoise if you just want to convert a callback into a promise
// We'll use this when we do our authorization
connection.queryPromise = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// go farther, and if you want to process the results of your promise and return the results
// you want to make a blocking function that always returns err and rows
connection.querySync = async (sql, params) => {
  let promise = new Promise((resolve, reject) => {
    console.log(`executing query, ${sql}`);
    connection.query(sql, params, (err, results) => {
      if (err) {
        console.log(`rejecting`);
        return reject(err);
      } else {
        console.log(`resolving`);
        return resolve(results);
      }
    });
  });
  let results = await promise
    .then((results) => {
      console.log(`results, ${results}`);
      return results;
    })
    .catch((err) => {
      throw err;
    });
  return results;
};

// make connection

module.exports = connection;

// make a note: previous project that had a public folder?
