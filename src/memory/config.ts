/*
 * Config Manager
 *
 * The config contains various information about the bot account.
 * This global manager takes care of loading the config from memory and returning the values.
*/

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Snowflake } from "discord.js";

import type { Config } from "../@types/MemoryFiles";

/**
 * The file path of the config memory file.
 */
let filePath = "";

/**
 * The local copy of the config.
 */
let config: Config;

/**
 * Sets the account name so the memory file can be loaded.
 * Should be called before trying to access the config.
 * Assumes the account name is valid.
 * @param account a valid account name
 */
export function setAccount(account: string): void {
	filePath = join(__dirname, "..", "..", "accounts", account, "config.json");
	load();
}

/**
 * Loads the config from the memory file.
 */
function load(): void {
	const json: unknown = JSON.parse(readFileSync(filePath).toString());
	if (json instanceof Object && hasAllConfigProperties(json)) {
		config = json as Config;
	}
	else {
		throw new Error(`The config memory file at ${filePath} is not properly formatted`);
	}
}

/**
 * There really should be a better way to do this with TypeScript, but whatever.
 * @returns whether the given object has all properties of the Config type
 */
function hasAllConfigProperties(json: unknown): boolean {
	return Object.prototype.hasOwnProperty.call(json, "clientId") &&
	Object.prototype.hasOwnProperty.call(json, "token") &&
	Object.prototype.hasOwnProperty.call(json, "url");
}

/**
 * @returns a read-only copy of the whitelist
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
