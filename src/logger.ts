import colors from "@colors/colors/safe.js";

/**
 * The default logger for this application. Set to the console for now.
 * Should not be accessed outside this logger file - instead, use the endpoint methods.
 */
const logger: Console = console;

/**
 * Wrapper for `Console.error`.
 *
 * @param message The message to print
 */
export function error (...params: unknown[]): void {
	params = params.map(p => typeof p === "string" ? colors.red(p) : p);
	logger.error(...params);
}

/**
 * Wrapper for `Console.warn`.
 *
 * @param message The message to print
 */
export function warn (...params: unknown[]): void {
	params = params.map(p => typeof p === "string" ? colors.yellow(p) : p);
	logger.warn(...params);
}

/**
 * Wrapper for `Console.info`.
 *
 * @param message The message to print
 */
export function info (...params: unknown[]): void {
	params = params.map(p => typeof p === "string" ? colors.white(p) : p);
	logger.info(...params);
}

/**
 * Wrapper for `Console.debug`.
 *
 * @param message The message to print
 */
export function debug (...params: unknown[]): void {
	params = params.map(p => typeof p === "string" ? colors.gray(p) : p);
	logger.debug(...params);
}
