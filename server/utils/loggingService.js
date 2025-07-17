const Log = require("../model/LogModel.js");

/**
 * Creates a log entry in the database
 * @param {Object} logData - Data to be logged
 * @param {String} logData.action - What action was performed
 * @param {String} logData.module - Which module/controller was used
 * @param {String} logData.method - Which method was called
 * @param {String} logData.userId - ID of the user who performed the action
 * @param {String} logData.userName - Name of the user who performed the action
 * @param {String} logData.userRole - Role of the user who performed the action
 * @param {String} logData.targetId - ID of the affected resource
 * @param {Object} logData.details - Additional details about the action
 * @param {String} logData.ipAddress - IP address of the user
 * @param {String} logData.userAgent - User agent of the user's browser
 * @param {String} logData.status - Whether the action succeeded or failed
 * @param {String} logData.errorMessage - Error message if the action failed
 * @returns {Promise<Object>} - The created log entry
 */
const createLog = async (logData) => {
  try {
    const log = new Log(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error("Error creating log:", error);
    // Don't throw the error - logging should never break the application
    return null;
  }
};

/**
 * Creates a middleware that logs actions
 * @param {String} module - The module/controller name
 * @param {String} method - The method name
 * @param {String} action - The action description
 * @returns {Function} - Express middleware function
 */
const logMiddleware = (module, method, action) => {
  return async (req, res, next) => {
    // Store the original res.json method
    const originalJson = res.json;

    // Override res.json method to capture the response
    res.json = function (data) {
      res.locals.responseData = data;

      // Call the original json method
      return originalJson.call(this, data);
    };

    // Continue with the request
    next();

    try {
      // Extract user info from request
      const userId = req.userId; // Set by verifyToken middleware

      // Create log entry after the request is processed
      const logData = {
        action,
        module,
        method,
        userId,
        targetId: req.params.id || null,
        details: {
          requestBody: req.body,
          requestParams: req.params,
          requestQuery: req.query,
          responseStatus: res.statusCode,
          responseSuccess: res.locals.responseData?.success,
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        status:
          res.statusCode >= 200 && res.statusCode < 400 ? "success" : "failure",
        errorMessage: res.locals.responseData?.message || null,
      };

      // If we have user info in the response, add it to the log
      if (res.locals.responseData?.user) {
        logData.userName =
          res.locals.responseData.user.fullName ||
          res.locals.responseData.user.name;
        logData.userRole = res.locals.responseData.user.role;
      }

      await createLog(logData);
    } catch (error) {
      console.error("Error in logging middleware:", error);
      // Don't throw the error - logging should never break the application
    }
  };
};

/**
 * Logs an action directly (not as middleware)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} module - The module/controller name
 * @param {String} method - The method name
 * @param {String} action - The action description
 * @param {String} status - 'success' or 'failure'
 * @param {String} errorMessage - Error message if status is 'failure'
 * @param {Object} additionalDetails - Any additional details to log
 * @returns {Promise<Object>} - The created log entry
 */
const logAction = async (
  req,
  res,
  module,
  method,
  action,
  status = "success",
  errorMessage = null,
  additionalDetails = {}
) => {
  try {
    const userId = req.userId; // Set by verifyToken middleware

    const logData = {
      action,
      module,
      method,
      userId,
      targetId: req.params.id || null,
      details: {
        requestBody: req.body,
        requestParams: req.params,
        requestQuery: req.query,
        ...additionalDetails,
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      status,
      errorMessage,
    };

    // If we have user info in the request, add it to the log
    if (req.user) {
      logData.userName = req.user.fullName || req.user.name;
      logData.userRole = req.user.role;
    }

    return await createLog(logData);
  } catch (error) {
    console.error("Error logging action:", error);
    // Don't throw the error - logging should never break the application
    return null;
  }
};

module.exports = {
  createLog,
  logMiddleware,
  logAction,
};
