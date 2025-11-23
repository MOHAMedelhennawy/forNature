import logger from "../../utils/logger.js";

class AppError extends Error {
	constructor(message, statusCode, description, isOperational) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.description = description;
		this.isOperational = isOperational;

		logger.error(
			`[AppError] ${message} | StatusCode: ${statusCode} | Description: ${description}`,
		);

		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;