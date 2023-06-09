/*
 * Whitelist Manager
 *
 * The whitelist is the list of channels that the bot is allowed to speak in.
 * This global manager takes care of...
 * - loading the whitelist channel IDs from memory
 * - fetching and validating the channels
 * - adding and removing channels
 * - saving the whitelist channel IDs to memory
 *
 * Before the whitelist can be used, the following methods must be called in this order:
 * 1. `loadFrom` - to load the channel IDs from the whitelist memory file
 * 2. `populate` - to fetch the channels from the Discord API
*/

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { DMChannel, NewsChannel, StageChannel, TextChannel, ThreadChannel, VoiceChannel } from "discord.js";
import type { Channel, Client, Snowflake, TextBasedChannel } from "discord.js";

import { getCurrentDirectory } from "../helpers/getCurrentDirectory.js";
import { warn } from "../logger.js";

/**
 * The format of the whitelist JSON file.
 * See an example in [accounts/ExampleUsername/whitelist.json](../../accounts/ExampleUsername/whitelist.json).
 */
type WhitelistFile = Snowflake[];

/**
 * The file path of the whitelist memory file.
 */
let filePath = "";

/**
 * The validated list of channels included in the whitelist.
 */
let whitelist: TextBasedChannel[] = [];

/**
 * A temporary list of channel IDs loaded from the whitelist memory file,
 * waiting to be fetched from the Discord API.
 */
let whitelistAsChannelIDs: WhitelistFile = [];

/**
 * Loads the whitelist from the memory file, and creates one if it does not yet exist.
 * Saves the channel IDs for later to be fetched by calling `populate`.
 *
 * Should be called before trying to use the whitelist.
 *
 * @param userID The bot user's ID
 * @throws If the memory file is improperly formatted
 */
export function loadFrom (userID: string): void {
	// Create the user's memory directory if it does not exist
	const directoryPath = join(getCurrentDirectory(import.meta.url), "..", "..", "memory", userID);
	if (!existsSync(directoryPath)) {
		mkdirSync(directoryPath, { recursive: true });
	}

	// Create the whitelist file if it does not exist
	filePath = join(directoryPath, "whitelist.json");
	if (!existsSync(filePath)) {
		save();
	}

	// Load the memory file
	const fileBuffer = readFileSync(filePath);
	const fileStr = fileBuffer.toString();
	const json: unknown = JSON.parse(fileStr);

	// Validate the file formatting
	if (isValidWhitelistFile(json)) {
		whitelistAsChannelIDs = json;
	}
	else {
		throw new Error(`The whitelist memory file at ${filePath} is not properly formatted.`);
	}
}

/**
 * @returns Whether the given JSON is a properly formatted whitelist file
 */
function isValidWhitelistFile (json: unknown): json is WhitelistFile {
	return Array.isArray(json)
		&& json.every(value => typeof value === "string");
}

/**
 * Uses the saved list of channel IDs from `loadFrom` and fetches the channels from the Discord API.
 * Validates each channel and removes invalid channels by overwriting the whitelist memory file afterwards.
 *
 * Should be called after calling `loadFrom` and before trying to use the whitelist.
 *
 * Important: the client passed to this method must be logged in to the account that the whitelist is for.
 *
 * @param client A logged-in Discord client to use to fetch channels
 */
export async function populate (client: Client) {
	// Fetch and validate channels
	whitelist = [];
	for (const channelID of whitelistAsChannelIDs) {
		const channel = await fetchAndValidateChannel(channelID, client);
		if (channel !== undefined) {
			whitelist.push(channel);
		}
	}

	// Overwrite memory file if there were any invalid channel IDs
	if (whitelist.length < whitelistAsChannelIDs.length) {
		warn("Removing invalid channels from whitelist");
		warn();
		save();
	}
}

/**
 * Fetches the given channel from the Discord API and validates it.
 *
 * @returns The channel, or undefined if the channel could not be found or is invalid
 */
async function fetchAndValidateChannel (channelID: Snowflake, client: Client): Promise<TextBasedChannel | undefined> {
	let channel = undefined;
	try {
		channel = await client.channels.fetch(channelID);
	}
	catch (error) {
		if (error instanceof Error) {
			if (error.message === "Unknown Channel") {
				warn(`Found unknown channel in the whitelist with ID ${channelID}`);
				return undefined;
			}
			else if (error.message === "Missing Access") {
				warn(`Found restricted channel in the whitelist with ID ${channelID}`);
				return undefined;
			}
		}
		else {
			throw error;
		}
	}

	if (channel === undefined || channel === null) {
		warn(`Could not find channel in the whitelist with ID ${channelID}`);
		return undefined;
	}

	if (!isTextBasedChannel(channel)) {
		warn(`Found channel of invalid type ${channel.constructor.name} in whitelist with ID ${channelID}`);
		return undefined;
	}

	try {
		await channel.messages.fetch({ limit: 1 });
	}
	catch (error) {
		if (error instanceof Error) {
			if (error.message === "Missing Access") {
				warn(`Found restricted channel in the whitelist with ID ${channelID}`);
				return undefined;
			}
		}
		else {
			throw error;
		}
	}

	return channel;
}

/**
 * @returns Whether the given channel is a text-based channel
 */
function isTextBasedChannel (channel: Channel): channel is TextBasedChannel {
	return channel instanceof DMChannel
	|| channel instanceof NewsChannel
	|| channel instanceof StageChannel
	|| channel instanceof TextChannel
	|| channel instanceof ThreadChannel
	|| channel instanceof VoiceChannel;
}

/**
 * Only returns a read-only copy of the whitelist to prevent illegal editing.
 * Use the `addChannel` and `removeChannel` methods for whitelist editing.
 *
 * @returns A read-only copy of the whitelist
 */
export function getWhitelist (): readonly TextBasedChannel[] {
	return whitelist;
}

/**
 * Writes the whitelist channel IDs to the memory file.
 */
function save (): void {
	whitelistAsChannelIDs = getWhitelist().map(channel => channel.id);
	writeFileSync(filePath, JSON.stringify(whitelistAsChannelIDs));
}

/**
 * Adds a channel to the whitelist and saves the memory file.
 *
 * @param channel The channel to whitelist
 * @returns `true` if successful, `false` if the channel was already in the whitelist
 */
export function addChannel (channel: TextBasedChannel): boolean {
	if (!hasChannel(channel)) {
		whitelist.push(channel);
		save();
		return true;
	}
	return false;
}

/**
 * Removes a channel from the whitelist and saves the memory file.
 *
 * @param channel The channel to unwhitelist
 * @returns `true` if successful, `false` if the channel was already not in the whitelist
 */
export function removeChannel (channel: TextBasedChannel): boolean {
	if (hasChannel(channel)) {
		whitelist.splice(whitelist.indexOf(channel), 1);
		save();
		return true;
	}
	return false;
}

/**
 * Checks if a channel is in the whitelist.
 *
 * @param channel The channel to check
 * @returns `true` if the channel is in the whitelist, `false` if not
 */
export function hasChannel (channel: TextBasedChannel): boolean {
	return whitelist.includes(channel);
}
