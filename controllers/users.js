const mysql = require("mysql");
const db = require("../sql/connection");
const { handleSQLError } = require("../sql/error");

const getAllUsers = (req, res) => {
  // SELECT ALL USERS
  const queryString = `select * from users u
  JOIN usersAddress a on
  u.id = a.user_id
  JOIN usersContact c on
  u.id = c.user_id;`;

  db.query(queryString, (err, rows) => {
    if (err) {
      console.log("getAllUsers query failed, ", err);
      res.sendStatus(500); // it's the server's fault
    } else {
      return res.json(rows);
    }
  });

  // older syntac
  // db.query(queryString, (err, rows) => {
  //   if (err) return handleSQLError(res, err);
  //   return res.json(rows);
  // });
};

const getUserById = (req, res) => {
  // SELECT USERS WHERE ID = <REQ PARAMS ID>
  // /users/:id
  // check for valid ID
  // if there's not a valid ID, send status of 400
  let id = req.params.id;
  if (!id) {
    res.sendStatus(400);
    return;
  }
  // what if they added a 'drop table users' to your query string?
  // that would be real effing bad
  // this is called a SQL Injection attack
  let sql = `SELECT 
  *
FROM
  users u
      JOIN
  usersAddress a ON u.id = a.user_id
      JOIN
  usersContact c ON u.id = c.user_id
WHERE
  u.id = ?
  `;
  const param = [id];
  // OLD SYNTAX:
  // sql = mysql.format(sql, param);

  // db.query(sql, (err, rows) => {
  //   if (err) return handleSQLError(res, err);
  //   return res.json(rows);
  // });
  // now the paramaterized query is the second argument here:
  db.query(sql, param, (err, rows) => {
    if (err) {
      console.log("getUserById query failed, ", err);
      res.sendStatus(500); // it's the server's fault
    } else if (rows.length > 1) {
      console.log(`there's more than 1 id getting returned + ${id}`);
      res.sendStatus(500); // this is a data integrity error
    } else if (rows.length == 0) {
      //
      res.status(404).send(`nothing to return`); // this is a data integrity error
    } else {
      // by default, rows will be an array of obs, not the target object
      return res.json(rows[0]);
    }
  });
};

const createUserCallbackHell = (req, res) => {
  // we're gonna insert all three tables
  // INSERT INTO USERS FIRST AND LAST NAME
  // ^^creates id needed for next 2 queries.
  //    first insert MUST complete before we can execute the other 2.
  //      INSERT INTO usersContact user_id (foreign key), phone1, phone2, email
  //      INSERT INTO usersAddress user_id (foreign key), address, city, county, state, zip
  // the kicker: mysql doesn't have built-in methods to create blocking code out of the box.
  // some DBs do. MariaDB, for example.
  // One way to handle: create nested callbacks that execute each query one at a time.
  //    this gets out of hand pretty quickly; "Callback Hell".

  // CALLBACK HELL VERSION LET'S GOOOO
  // first query
  const { first_name, last_name } = req.body;
  let params = [first_name, last_name];

  let sql = "INSERT INTO users (first_name, last_name) VALUES (?, ?)";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log("createUser query failed, ", err);
      res.sendStatus(500); // it's the server's fault
    } else {
      // if here, the first query executed.

      // postman check
      // res.json(rows);

      // SECOND QUERY
      // I need the ID of the record that we just inserted.
      const getId = rows.insertId;
      // res.json("lookin good");
      const { address, city, county, state, zip } = req.body;

      const params2 = [getId, address, city, county, state, zip];
      /*
      INSERT INTO usersAddress
	      (user_id, address, city, county, state, zip)  
        VALUES 
      */
      let addressSql =
        "INSERT INTO usersAddress (user_id, address, city, county, state, zip) VALUES ";
      addressSql += "(?, ?, ?, ?, ?, ?)";
      db.query(addressSql, params2, (err, rows) => {
        if (err) {
          console.log(`insert into usersAddress failed, `, err);
        } else {
          // second query worked
          // postman check
          // res.json(rows);

          // THIRD QUERY
          // promises
          /*
          INSERT INTO usersContact
	          (user_id, phone1, phone2, email)
              VALUES 
              (92,"626-572-1096","626-696-2777","cory.gibes@gmail.com")
          */
          const { phone1, phone2, email } = req.body;
          let sql3 = `insert into usersContact (user_id, phone1, phone2, email) VALUES (?, ?, ?, ?)`;
          let params3 = [getId, phone1, phone2, email];
          db.query(sql3, params3, (err, rows) => {
            if (err) {
              console.log(`insert into usersContacts failed, `, err);
              res.sendStatus(500);
            } else {
              // if here, query worked
              // postman check
              res.json(rows);
            }
          });
        }
      });
    }
  });

  /*
{
    "id": 499,
    "first_name": "Jimmy",
    "last_name": "Smith",
    "user_id": 5,
    "address": "1234 W 20th Ave",
    "city": "Austin",
    "county": "Travis",
    "state": "TX",
    "zip": "78704",
    "phone1": "555-555-5555",
    "phone2": "444-444-4444",
    "email": "jimmy.smith@cox.net"
}
  */

  // after the POST to users table, returned JSON
  /*
{
    "fieldCount": 0,
    "affectedRows": 1,
    "insertId": 501,
    "serverStatus": 2,
    "warningCount": 0,
    "message": "",
    "protocol41": true,
    "changedRows": 0
}

  you'd think we could use the insertId
  */
};

const createUser = async (req, res) => {
  // sync uses promises (async, await)
  // querySync()
  const { first_name, last_name } = req.body;
  let params = [first_name, last_name];
  let sql = "INSERT INTO users (first_name, last_name) VALUES (?, ?)";
  let results;
  try {
    results = await db.querySync(sql, params);
    // postman check
    // res.json(results);
  } catch (err) {
    console.log(`Insert into users failed, ${err}`);
    res.sendStatus(500);
    return; // if query doesn't work, just stop
  }

  // SECOND QUERY
  const getId = results.insertId;
  const { address, city, county, state, zip } = req.body;
  params = [getId, address, city, county, state, zip];
  sql =
    "INSERT INTO usersAddress (user_id, address, city, county, state, zip) VALUES (?, ?, ?, ?, ?, ?)";
  //
  try {
    results = await db.querySync(sql, params);
    // postman check
    // res.json(results);
  } catch (err) {
    console.log(`Insert into usersAddress failed, ${err}`);
    res.sendStatus(500);
    return; // if query doesn't work, just stop
  }

  // THIRD QUERY
  const { phone1, phone2, email } = req.body;
  sql = `insert into usersContact (user_id, phone1, phone2, email) VALUES (?, ?, ?, ?)`;
  params = [getId, phone1, phone2, email];

  try {
    results = await db.querySync(sql, params);
    console.log(`Insert into usersContact SUCCEEDED!`);
    res.json(results);
  } catch (err) {
    console.log(`Insert into usersContact failed, ${err}`);
    res.sendStatus(500);
    return; // if query doesn't work, just stop
  }
};

const updateUserById = (req, res) => {
  // UPDATE USERS AND SET FIRST AND LAST NAME WHERE ID = <REQ PARAMS ID>
  // only allowing first and last name
  const id = req.params.id;
  const { first_name, last_name } = req.body;

  let params = [first_name, last_name, id];

  let sql = `UPDATE users SET first_name = ?, last_name = ? WHERE id = ?`;

  if (!id) {
    res.status(400).json({ message: "That's not a valid id" });
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.log("update users failed, ", err);
      res.sendStatus(500);
    } else {
      res.json(results);
    }
  });
};

const deleteUserByFirstName = (req, res) => {
  // DELETE FROM USERS WHERE FIRST NAME = <REQ PARAMS FIRST_NAME>
  let params = [req.params.first_name];
  let sql = "delete from users where first_name = ?";
  db.query(sql, params, (err, results) => {
    if (err) {
      console.log("error in delete statement", err);
      res.sendStatus(500);
    } else {
      console.log(`Delete Successful`);
      res.json({ message: `deleted ${results.affectedRows} user(s)` });
    }
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserByFirstName,
};
