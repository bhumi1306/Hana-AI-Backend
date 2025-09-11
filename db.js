const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'host-name',
    user: 'username',
    password: 'your-pass',
    database: 'dbname',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+05:30' 
});

module.exports = pool;
