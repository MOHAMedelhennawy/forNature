import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {

    if (err.errors && err.errors.length > 0) {
      const formattedErrors = err.errors.map(error => {
        return {
          field: error.instancePath.replace('/', ''),
          message: error.message
        };
      });
      
      logger.error(`error: ${err.errors}`)
      return res.status(400).json({
        success: false,
        errors: formattedErrors
      });
    }
  
    // Handle other types of errors
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'An unexpected error occurred.'
    });
};

export default errorMiddleware;