/*
 * Config Manager
 *
 * The config contains various information about the bot account.
 * This global manager takes care of loading the config from memory and returning the values.
*/

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Snowflake } from "discord.js";

import type { Config } from "../@types/MemoryFiles.js";
import { getCurrentDirectory } from "../helpers/getCurrentDirectory.js";

/**
 * The file path of the config memory file.
 */
let filePath = "";

/**
 * The local copy of the config.
 */
let config: Config;

/**
 * Sets the account name and loads the config from the memory file.
 *
 * Should be called before trying to access the config.
 *
 * @param account a valid account name
 * @throws if the account name is not valid, or if the memory file is improperly formatted
 */
export function loadFrom(account: string): void {
	filePath = join(getCurrentDirectory(import.meta.url), "..", "..", "accounts", account, "config.json");

	// Load the memory file
	const fileBuffer = readFileSync(filePath);
	const fileStr = fileBuffer.toString();
	const json: unknown = JSON.parse(fileStr);

	// Validate the file formatting
	if (json instanceof Object && hasAllConfigProperties(json)) {
		config = json as Config;
	}
	else {
		throw new Error(`The config memory file at ${filePath} is not properly formatted`);
	}
}

/**
 * @returns whether the given object has all properties of the Config type
 */
function hasAllConfigProperties(json: unknown): boolean {
	return Object.prototype.hasOwnProperty.call(json, "clientId") &&
	Object.prototype.hasOwnProperty.call(json, "token") &&
	Object.prototype.hasOwnProperty.call(json, "url");
}

/**
 * @returns the full config
 */
export function getConfig(): Config {
	return config;
}

/**
 * @returns the user ID of the bot account
 */
export function getClientID(): Snowflake {
	return config.clientId;
}

/**
 * WARNING: do not store or log your token in any publicly available place, or your bot will get hacked!
 *
 * @returns the discord token necessary to log-in the client
 */
export function getToken(): string {
	return config.token;
}

/**
 * @returns the URL for adding the bot to a server
 */
export function getURL(): string {
	return config.url;
}
