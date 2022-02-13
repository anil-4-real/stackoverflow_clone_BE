const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
require("dotenv").config();
const dbUrl = process.env.DB_URL;

module.exports = { mongodb, MongoClient, dbUrl };
