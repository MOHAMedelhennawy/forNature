import { Prisma } from "@prisma/client";
import AppError from "./AppError.js";
import logger from "../../utils/logger.js";

export const handlePrismaQuery = (queryFn) => {
	return async (...args) => {
		try {
			return await queryFn(...args);
		} catch (error) {
			logger.error("Prisma Error:", error);

			if (error instanceof AppError) {
				throw error;
			}

			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				switch (error.code) {
					case "P2002":
						throw new AppError(
							"Duplicate key error.",
							409,
							`A unique constraint failed on the field(s): ${error.meta?.target?.join(", ")}`,
							true,
						);

					case "P2000":
						throw new AppError(
							"Input value too long.",
							400,
							`The provided value for a field is too long. Field: ${error.meta?.column_name || "unknown"}`,
							true,
						);

					case "P2004":
						throw new AppError(
							"Constraint violation.",
							400,
							"The database constraint was violated.",
							true,
						);

					case "P2025":
						throw new AppError(
							"Record not found.",
							404,
							"The requested record could not be found in the database.",
							true,
						);

					default:
						throw new AppError("Database error.", 500, error.message, false);
				}
			}

			if (error instanceof Prisma.PrismaClientInitializationError) {
				throw new AppError(
					"Database connection failed.",
					500,
					error.message,
					false,
				);
			}

			if (error instanceof Prisma.PrismaClientRustPanicError) {
				throw new AppError(
					"Database engine crashed.",
					500,
					"Prisma's underlying engine panicked and crashed.",
					false,
				);
			}

			// Fallback for unknown errors
			throw new AppError("Unexpected server error.", 500, error.message, false);
		}
	};
};