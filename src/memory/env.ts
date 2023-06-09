/*
 * This manager takes care of loading and returning environment variables from the `.env` file.
*/

import { config } from "dotenv";

/**
 * The expected format of the `.env` file.
 * See an example in [.env-example](../../.env-example).
 */
interface EnvironmentVariables {
	TOKEN: string;
}

/** The local copy of the environment variables. */
let env: EnvironmentVariables;

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
 * @returns The discord token necessary to authenticate the client
 */
export function getToken (): string {
	return env.TOKEN;
}
