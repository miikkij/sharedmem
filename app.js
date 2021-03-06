"use strict";
import express from "express";
import path from "path";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import chalk from "chalk";
import cors from "cors";
import "app-module-path/register";
import { addPath } from "app-module-path";
addPath(__dirname);
import { logger } from "./libs/logger";

require('dotenv').config({ path: 'variables.env' })

const app = express();

import routes from "./routes/index";
import exampleRoutes from "./modules/examples/routes";

// Use mongoose native promises
mongoose.Promise = Promise;

/**
 * Connect to mongodb
 */
let DBOptions = {};
if (process.env.MONGO_USER) {
  DBOptions = {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD
  };
}
mongoose.connect(process.env.MONGO_URL || app.get("MONGO_URL"), DBOptions);
mongoose.connection.on("connected", function() {
  logger.info(chalk.underline(`APP MONGODB@${mongoose.version}:`), chalk.magenta(process.env.MONGO_URL));
});

mongoose.connection.on("disconnected", function() {
  logger.info(`Mongoose disconnected to: ${chalk.red.bold(process.env.MONGO_URL)}`);
});

process.on("SIGINT", function() {
  logger.info(chalk.red.bold("\nMongoose disconnected through app termination\n"));
  process.exit(0);
});

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// include all other routes here
app.use("/", routes);
app.use("/examples", exampleRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// production error handler
// no stacktraces leaked to user
if (app.get("env") === "production") {
  app.use(function(err, req, res, next) {
    logger.error("error helper: ", err);
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: {}
    });
  });
}

logger.info(chalk.underline("APP ENVIRONMENT: "), chalk.magenta(app.get("env")));

// development error handler
// will print stacktrace. ERROR middleware contains 4 parameters.
app.use(function(err, req, res, next) {
  logger.error("error middleware: ", req.originalUrl, err);
  res.status(err.status || 500);
  return res.json({
    message: err.message,
    error: err
  });
});

export default app;
