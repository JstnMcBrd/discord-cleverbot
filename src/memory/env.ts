/*
 * Takes care of loading and returning environment variables from the `.env` file.
*/

import { config } from "dotenv";

/**
 * The expected format of the `.env` file.
 * See an example in [.env-example](../../.env-example).
 */
interface Environment {
	TOKEN: string;
}

/** The local copy of the environment. */
let environment: Environment;

/**
 * Loads the environment from the `.env` file and validates the formatting.
 *
 * Should be called before trying to access the environment.
 *
 * @throws If the `.env` file is improperly formatted
 */
export function load (): void {
	const processEnv = {};
	config({ processEnv });

	if (!isValidEnvironment(processEnv)) {
		throw new Error("The .env file at is missing the required variables.");
	}

	environment = processEnv;
}

/**
 * @returns Whether the given environment has all of the required variables.
 */
function isValidEnvironment (env: unknown): env is Environment {
	return env instanceof Object
		&& Object.prototype.hasOwnProperty.call(env, "TOKEN");
}

/**
 * WARNING: do not store or log your token in any publicly available place, or your bot will get hacked!
 *
 * @returns The Discord token necessary to authenticate the client
 */
export function getToken (): string {
	return environment.TOKEN;
}
