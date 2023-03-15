"use strict";

var mongoose = require("mongoose");

var connectDatabase = function connectDatabase() {
  mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    family: 4
  }).then(function (data) {
    console.log("Mongodb connected with server: ".concat(data.connection.host));
  });
};

module.exports = connectDatabase;