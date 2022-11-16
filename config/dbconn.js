require('dotenv').config();
const {createPool} = require('mysql');
 
//Create connection variable

const connection = createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    port: process.env.PORT,
    database: process.env.DATABASE,
    multipleStatements: true,
    connectionLimit: 5
});

module.exports = connection;