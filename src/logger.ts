import colors from "@colors/colors/safe.js";

/**
 * The default logger for this application. Set to the console for now.
 * Should not be accessed outside this logger file - instead, use the endpoint methods.
 */
const logger: Console = console;

/**
 * Wrapper for `Console.error` that colors text red.
 *
 * @param message The message to print
 */
export function error (message?: unknown): void {
	message = message ? message : "";

	if (typeof message === "string") {
		message = colors.red(message);
	}

	logger.error(message);
}

/**
 * Wrpaper for `Console.warn` that colors text yellow.
 *
 * @param message The message to print
 */
export function warn (message?: unknown): void {
	message = message ? message : "";

	if (typeof message === "string") {
		message = colors.yellow(message);
	}

	logger.warn(message);
}

/**
 * Wrapper for `Console.info` that colors text green.
 *
 * @param message The message to print
 */
export function info (message?: unknown): void {
	message = message ? message : "";

	if (typeof message === "string") {
		message = colors.green(message);
	}

	logger.info(message);
}

/**
 * Wrapper for `Console.debug` that colors text gray.
 *
 * @param message The message to print
 */
export function debug (message?: unknown): void {
	message = message ? message : "";

	if (typeof message === "string") {
		message = colors.gray(message);
	}

	logger.debug(message);
}
