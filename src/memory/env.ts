/*
 * Takes care of loading and returning environment variables from the `.env` file.
*/

import { env } from 'node:process';

/**
 * WARNING: do not store or log your token in any publicly available place, or your bot will get hacked!
 *
 * @returns The Discord token necessary to authenticate the client, retrieved from the local .env file
 * @throws If the .env file does not contain a token
 */
export function getToken(): string {
	return getRequiredEnvVar('TOKEN');
}

/**
 * Retrieves the requested environment variable from the local .env file
 * @throws If the requested environment variable is not included, not defined, or empty
 */
function getRequiredEnvVar(name: string): string {
	const value = env[name];
	if (!value) {
		throw new TypeError(`Missing required '${name}' environment variable.`);
	}
	return value;
}
