"use strict";
import { logger } from "../../../libs/logger";
import Example from "../models";

// import other needed modules here

export const getAllExamples = (req, res, next) => {
  logger.info("Request Body ===>", req.body);

  try {
    let querySpec = {
      status: "Active"
    };

    // Accept only query parameters that are defined in the schema

    for (let property in Example.schema.obj) {
      if (Example.schema.obj.hasOwnProperty(property) && property in req.query) {
        querySpec[property] = req.query[property];
      }
    }

    // For other type of queries write them here

    // Build the query

    let query = Example.find(querySpec);

    if ("sort_by" in req.query) {
      let params = req.query.sort_by.split(".");
      let sortyBy = params[0];

      if (Example.schema.obj.hasOwnProperty(sortyBy)) {
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
    Promise.all([Example.count(querySpec), query.exec()])
      .then(function(results) {
        let count = results[0];
        let data = results[1];
        return res.status(200).json({
          success: true,
          message: "All examples fetched successfully!",
          data: data,
          meta: { count: count }
        });
      })
      .catch(function(error) {
        logger.error("Error into Example.getAllExamples() Promise.catch(error)===>", error.message);
        return res.status(501).json({
          success: false,
          message: "Error in fetching examples " + error.message,
          error: error
        });
      });
  } catch (e) {
    logger.error("Error into Example.getAllExamples(catch)===>", e);
    return res.status(501).json({
      success: false,
      message: "Something went wrong, Try Again",
      error: e
    });
  }
};

export const addNewExample = (req, res, next) => {
  logger.info("Request body ===>", req.body);
  try {
    let input = {};

    // only accepts input fields defined in schema. ignore others
    for (let property in Example.schema.obj) {
      if (Example.schema.obj.hasOwnProperty(property) && property in req.body) {
        input[property] = req.body[property];
      }
    }

    if (Object.keys(input).length == 0) {
      let paramError = new Error("No input fields provided");
      logger.error("Error into Example.createExample()===>", paramError);
      return res.status(501).json({
        success: true,
        message: paramError.message,
        error: paramError
      });
    }

    Example.create(input, function(error, data) {
      if (error) {
        return res.status(501).json({
          success: false,
          message: "Error in creating example" + error.message,
          error: error
        });
      }
      return res.status(201).json({
        success: true,
        message: "New example created successfully!",
        data: data
      });
    });
  } catch (e) {
    logger.error("Error into Example.addNewExample(catch)===>", e);
    return res.status(501).json({
      success: false,
      message: "Something went wrong",
      error: e
    });
  }
};

export const getExample = (req, res, next) => {
  logger.info("Request Query and parameters  ===>", req.query, req.params);
  try {
    Example.findOne({ _id: req.params._id, status: "Active" }, function(error, data) {
      if (error) {
        logger.error("Error into fetching example in Example.getExample(cb) ===>", error);
        return res.status(error.statusCode || 501).json({
          success: false,
          message: "Error in fetching single example information",
          error: error
        });
      } else {
        logger.data("response from Example.getExample(cb)===>");
        return res.status(200).json({
          success: true,
          message: "The example information has been fetched successfully",
          data: data
        });
      }
    });
  } catch (e) {
    logger.error("Error into Example.getExample(catch)===>", e);
    return res.status(501).json({
      success: false,
      message: "Something went wrong",
      error: e
    });
  }
};

export const updateExample = (req, res, next) => {
  logger.info("Request body, params ===>", req.body, req.params);
  try {
    if (!req.params._id) {
      let paramError = new Error("No id provided");
      logger.error("Error into Example.updateExample()===>", paramError);
      return res.status(501).json({
        success: true,
        message: paramError.message,
        error: paramError
      });
    }

    let input = {};

    // only accepts update fields defined in schema. ignore others
    for (let property in Example.schema.obj) {
      if (Example.schema.obj.hasOwnProperty(property) && property in req.body) {
        input[property] = req.body[property];
      }
    }

    if (Object.keys(input).length == 0) {
      let paramError = new Error("No update fields provided");
      logger.error("Error into Example.updateExample()===>", paramError);
      return res.status(501).json({
        success: true,
        message: paramError.message,
        error: paramError
      });
    }

    Example.findOneAndUpdate({ _id: req.params._id }, { $set: input }, function(error, updatedExample) {
      if (error) {
        logger.error("Error into Example.updateExample(cb)===>", error);
        return res.status(501).json({
          success: true,
          message: "Error in updating example",
          error: e
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "The example has been updated successfully!",
          data: updatedExample
        });
      }
    });
  } catch (e) {
    logger.error("Error into Example.updateExample(catch)===>", e);
    return res.status(501).json({
      success: true,
      message: "Something went wrong",
      error: e
    });
  }
};

export const deleteExample = (req, res, next) => {
  logger.info("Request body ===>", req.body);
  try {
    if (!req.params._id) {
      let paramError = new Error("No id provided");
      logger.error("Error into Example.deleteExample()===>", paramError);
      return res.status(501).json({
        success: true,
        message: paramError.message,
        error: paramError
      });
    }

    // record is archived instead of deleted
    Example.findOneAndUpdate({ _id: req.params._id }, { $set: { status: "Archived" } }, function(error, updatedExample) {
      if (error) {
        logger.error("Error into Example.deleteExample(cb)===>", error);
        return res.status(501).json({
          success: true,
          message: "Error in deleting example",
          error: e
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "The example has been deleted successfully!",
          data: updatedExample
        });
      }
    });
  } catch (e) {
    logger.error("Error into Example.deleteExample(catch)===>", e);
    return res.status(501).json({
      success: true,
      message: "Something went wrong",
      error: e
    });
  }
};
