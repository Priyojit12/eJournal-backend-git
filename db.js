const mongoose = require("mongoose");
require("dotenv").config();
// const mongURI = "mongodb://localhost:27017/ejournaldb?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
const mongURI = process.env.REACT_APP_DATA_BASE;


function connectToMongo() {
  mongoose.connect(mongURI);
}

module.exports = connectToMongo;
