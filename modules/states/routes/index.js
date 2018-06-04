"use strict";
import express from "express";
import { getAllStates, addNewState, getState, updateState, deleteState } from "../controllers";
const stateRoutes = express.Router();

stateRoutes
  .route("/")
  // get all states (accessed at GET http://base-url/states)
  .get(getAllStates)
  // create a state (accessed at POST http://base-url/states)
  .post(addNewState);

stateRoutes
  .route("/:_id")
  // get a single state (accessed at GET http://base-url/states/:_id)
  .get(getState)
  // update a single state (accessed at PUT http://base-url/states/:_id)
  .put(updateState)
  // delete a state (accessed at DELETE http://base-url/states/:_id)
  .delete(deleteState);

// And here the place for custom route and Endpoints

export default stateRoutes;
