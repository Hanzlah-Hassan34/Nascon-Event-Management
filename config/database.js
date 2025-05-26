const mysql = require('mysql2');

// Create a connection pool
const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '3234',
  database: 'iteration_2'
});


module.exports = database;
