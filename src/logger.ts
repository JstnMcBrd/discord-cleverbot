import colors from "@colors/colors/safe.js";

/**
 * The default logger for this application. Set to the console for now.
 * Should not be accessed outside this logger file - instead, use the endpoint methods.
 */
const logger: Console = console;

export function error(message?: unknown): void {
	message = message ? message : "";

	if (typeof message === "string") {
		message = colors.red(message);
	}

	logger.error(message);
}

export function warn(message?: unknown): void {
	message = message ? message : "";

	if (typeof message === "string") {
		message = colors.yellow(message);
	}

	logger.warn(message);
}

export function info(message?: unknown): void {
	message = message ? message : "";

	if (typeof message === "string") {
		message = colors.green(message);
	}

	logger.info(message);
}

export function debug(message?: unknown): void {
	message = message ? message : "";

	if (typeof message === "string") {
		message = colors.gray(message);
	}

	logger.debug(message);
}
