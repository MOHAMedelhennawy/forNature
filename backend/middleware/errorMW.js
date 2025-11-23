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
  
    // Handle AppError and other types of errors
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'An unexpected error occurred.',
      ...(err.description && { description: err.description })
    });
};

export default errorMiddleware;