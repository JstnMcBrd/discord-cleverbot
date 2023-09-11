import { inspect } from "node:util";

import colors from "@colors/colors/safe.js";

/** The default logger for this application. Set to the console for now. */
const logger: Console = console;

/**
 * Wrapper for `Console.error`.
 *
 * Note: string substitution will not work - use template literals instead.
 *
 * @param message The message to print
 */
export function error (...params: unknown[]): void {
	params = params.map(stringify).map(p => colors.red(p));
	logger.error(...params);
}

/**
 * Wrapper for `Console.warn`.
 *
 * Note: string substitution will not work - use template literals instead.
 *
 * @param message The message to print
 */
export function warn (...params: unknown[]): void {
	params = params.map(stringify).map(p => colors.yellow(p));
	logger.warn(...params);
}

/**
 * Wrapper for `Console.info`.
 *
 * Note: string substitution will not work - use template literals instead.
 *
 * @param message The message to print
 */
export function info (...params: unknown[]): void {
	params = params.map(stringify).map(p => colors.white(p));
	logger.info(...params);
}

/**
 * Wrapper for `Console.debug`.
 *
 * Note: string substitution will not work - use template literals instead.
 *
 * @param message The message to print
 */
export function debug (...params: unknown[]): void {
	params = params.map(stringify).map(p => colors.gray(p));
	logger.debug(...params);
}

/**
 * @returns The given parameter as a string, using node's built-in `util.inspect()` method.
 */
function stringify (param: unknown): string {
	if (typeof param === "string") {
		return param;
	}
	return inspect(param, undefined, undefined, false);
}
