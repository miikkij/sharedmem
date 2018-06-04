"use strict";
import { logger } from "../../../libs/logger";
import State from "../models";

// import other needed modules here

export const getAllStates = (req, res, next) => {
  logger.info("Request Body ===>", req.body);

  try {
    let querySpec = {
      status: "Active"
    };

    // Accept only query parameters that are defined in the schema

    for (let property in State.schema.obj) {
      if (State.schema.obj.hasOwnProperty(property) && property in req.query) {
        querySpec[property] = req.query[property];
      }
    }

    // For other type of queries write them here

    // Build the query

    let query = State.find(querySpec);

    if ("sort_by" in req.query) {
      let params = req.query.sort_by.split(".");
      let sortyBy = params[0];

      if (State.schema.obj.hasOwnProperty(sortyBy)) {
        let condition = {};
        condition[sortyBy] = 1;
        if (params.length > 1 && params[1].toLowerCase() == "asc") condition[sortyBy] = -1;

        query.sort(params);
      }
    }

    // Add pagination
    if ("page" in req.query) {
      let limit = 10;
      if ("limit" in req.query) limit = req.query.limit;
      query.limit(limit).skip((req.query.page - 1) * limit);
    }

    // execute query and count operation
    Promise.all([State.count(querySpec), query.exec()])
      .then(function(results) {
        let count = results[0];
        let data = results[1];
        return res.status(200).json({
          success: true,
          message: "All states fetched successfully!",
          data: data,
          meta: { count: count }
        });
      })
      .catch(function(error) {
        logger.error("Error into State.getAllStates() Promise.catch(error)===>", error.message);
        return res.status(501).json({
          success: false,
          message: "Error in fetching states " + error.message,
          error: error
        });
      });
  } catch (e) {
    logger.error("Error into State.getAllStates(catch)===>", e);
    return res.status(501).json({
      success: false,
      message: "Something went wrong, Try Again",
      error: e
    });
  }
};

export const addNewState = (req, res, next) => {
  logger.info("Request body ===>", req.body);
  try {
    let input = {};

    // only accepts input fields defined in schema. ignore others
    for (let property in State.schema.obj) {
      if (State.schema.obj.hasOwnProperty(property) && property in req.body) {
        input[property] = req.body[property];
      }
    }

    if (Object.keys(input).length == 0) {
      let paramError = new Error("No input fields provided");
      logger.error("Error into State.createState()===>", paramError);
      return res.status(501).json({
        success: true,
        message: paramError.message,
        error: paramError
      });
    }

    State.create(input, function(error, data) {
      if (error) {
        return res.status(501).json({
          success: false,
          message: "Error in creating state" + error.message,
          error: error
        });
      }
      return res.status(201).json({
        success: true,
        message: "New state created successfully!",
        data: data
      });
    });
  } catch (e) {
    logger.error("Error into State.addNewState(catch)===>", e);
    return res.status(501).json({
      success: false,
      message: "Something went wrong",
      error: e
    });
  }
};

export const getState = (req, res, next) => {
  logger.info("Request Query and parameters  ===>", req.query, req.params);
  try {
    State.findOne({ _id: req.params._id, status: "Active" }, function(error, data) {
      if (error) {
        logger.error("Error into fetching state in State.getState(cb) ===>", error);
        return res.status(error.statusCode || 501).json({
          success: false,
          message: "Error in fetching single state information",
          error: error
        });
      } else {
        logger.data("response from State.getState(cb)===>");
        return res.status(200).json({
          success: true,
          message: "The state information has been fetched successfully",
          data: data
        });
      }
    });
  } catch (e) {
    logger.error("Error into State.getState(catch)===>", e);
    return res.status(501).json({
      success: false,
      message: "Something went wrong",
      error: e
    });
  }
};

export const updateState = (req, res, next) => {
  logger.info("Request body, params ===>", req.body, req.params);
  try {
    if (!req.params._id) {
      let paramError = new Error("No id provided");
      logger.error("Error into State.updateState()===>", paramError);
      return res.status(501).json({
        success: true,
        message: paramError.message,
        error: paramError
      });
    }

    let input = {};

    // only accepts update fields defined in schema. ignore others
    for (let property in State.schema.obj) {
      if (State.schema.obj.hasOwnProperty(property) && property in req.body) {
        input[property] = req.body[property];
      }
    }

    if (Object.keys(input).length == 0) {
      let paramError = new Error("No update fields provided");
      logger.error("Error into State.updateState()===>", paramError);
      return res.status(501).json({
        success: true,
        message: paramError.message,
        error: paramError
      });
    }

    State.findOneAndUpdate({ _id: req.params._id }, { $set: input }, function(error, updatedState) {
      if (error) {
        logger.error("Error into State.updateState(cb)===>", error);
        return res.status(501).json({
          success: true,
          message: "Error in updating state",
          error: e
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "The state has been updated successfully!",
          data: updatedState
        });
      }
    });
  } catch (e) {
    logger.error("Error into State.updateState(catch)===>", e);
    return res.status(501).json({
      success: true,
      message: "Something went wrong",
      error: e
    });
  }
};

export const deleteState = (req, res, next) => {
  logger.info("Request body ===>", req.body);
  try {
    if (!req.params._id) {
      let paramError = new Error("No id provided");
      logger.error("Error into State.deleteState()===>", paramError);
      return res.status(501).json({
        success: true,
        message: paramError.message,
        error: paramError
      });
    }

    // record is archived instead of deleted
    State.findOneAndUpdate({ _id: req.params._id }, { $set: { status: "Archived" } }, function(error, updatedState) {
      if (error) {
        logger.error("Error into State.deleteState(cb)===>", error);
        return res.status(501).json({
          success: true,
          message: "Error in deleting state",
          error: e
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "The state has been deleted successfully!",
          data: updatedState
        });
      }
    });
  } catch (e) {
    logger.error("Error into State.deleteState(catch)===>", e);
    return res.status(501).json({
      success: true,
      message: "Something went wrong",
      error: e
    });
  }
};
