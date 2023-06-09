/*
 * Environment Variable Manager
 *
 * This global manager takes care of loading environment variables from the `.env` file and
 * returning the values.
*/

import { config } from "dotenv";

/**
 * The expected format of the `.env` file.
 * See an example in [.env-example](../../.env-example).
 */
interface Env {
	TOKEN: string;
}

/**
 * The local copy of the environment.
 */
let env: Env;

/**
 * Loads the environment from the `.env` file and validates the formatting.
 *
 * Should be called before trying to access the environment.
 *
 * @throws If the `.env` file is improperly formatted
 */
export function load (): void {
	config();

	const TOKEN = process.env["TOKEN"];
	if (!TOKEN) {
		throw new Error("The .env file at is missing the required \"TOKEN\" variable.");
	}

	env = {
		TOKEN,
	};
}

/**
 * WARNING: do not store or log your token in any publicly available place, or your bot will get hacked!
 *
 * @returns the discord token necessary to log-in the client
 */
export function getToken (): string {
	return env.TOKEN;
}
