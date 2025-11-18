import Ajv from "ajv";
import addFormats from "ajv-formats";
import ajvErrors from "ajv-errors";
import logger from "../utils/logger.js";

const ajv = new Ajv({ allErrors: true, useDefaults: true });
addFormats(ajv);
ajvErrors(ajv);

ajv.addKeyword({
	keyword: "priceIsFloat",
	validate: function (schema, data) {
		if (isNaN(data) || data <= 0) {
			// Check if price is a number and more than 0
			return false;
		}

		return true;
	},
	errors: false,
});

export function validateSchema(schema) {
	const validate = ajv.compile(schema);

	return (req, res, next) => {
		const valid = validate(req.body);
		if (!valid) {
			logger.error("Validation error");
			return res.status(400).json({
				message: "Validation error",
				errors: validate.errors,
			});
		}

		next();
	};
}