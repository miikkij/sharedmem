"use strict";
import express from "express";
import { getAllExamples, addNewExample, getExample, updateExample, deleteExample } from "../controllers";
const exampleRoutes = express.Router();

exampleRoutes
  .route("/")
  // get all examples (accessed at GET http://base-url/examples)
  .get(getAllExamples)
  // create a example (accessed at POST http://base-url/examples)
  .post(addNewExample);

exampleRoutes
  .route("/:_id")
  // get a single example (accessed at GET http://base-url/examples/:_id)
  .get(getExample)
  // update a single example (accessed at PUT http://base-url/examples/:_id)
  .put(updateExample)
  // delete a example (accessed at DELETE http://base-url/examples/:_id)
  .delete(deleteExample);

// And here the place for custom route and Endpoints

export default exampleRoutes;
