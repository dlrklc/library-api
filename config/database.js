const { Sequelize } = require('sequelize');

// Load environment variables from .env file
require('dotenv').config();

// Access the database credentials from environment variables
const dbHost = process.env.DB_HOST;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbDialect = process.env.DB_DIALECT;
const dbName = process.env.DB_NAME;

// Set up a connection to the database
const sequelize = new Sequelize({
  dialect: dbDialect,  
  host: dbHost,   
  username: dbUsername,
  password: dbPassword, 
  database: dbName, 
  logging: false,
});

module.exports = sequelize;