/*
 * The whitelist is the list of channels that the bot is allowed to speak in.
 * This manager takes care of...
 * - loading the whitelist channel IDs from memory
 * - fetching and validating the channels
 * - adding and removing channels
 * - saving the whitelist channel IDs to memory
 *
 * Before the whitelist can be used, `load()` must be called to read memory and fetch channels from
 * the Discord API.
*/

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { DMChannel, NewsChannel, StageChannel, TextChannel, ThreadChannel, VoiceChannel } from "discord.js";
import type { Channel, Client, Snowflake, TextBasedChannel } from "discord.js";

import { getCurrentDirectory } from "../helpers/getCurrentDirectory.js";
import { warn } from "../logger.js";

/**
 * The format of the whitelist JSON file.
 * See an example in [memory/example-user-id/whitelist.json](../../memory/example-user-id/whitelist.json).
 */
type WhitelistFile = Snowflake[];

/** The file path of the whitelist memory file. */
let filePath = "";

/** The validated list of channels included in the whitelist. */
const whitelist: TextBasedChannel[] = [];

/**
 * Loads the whitelist from the memory file, and creates one if it does not yet exist.
 * Fetches the channels from the Discord API, validates each channel, and removes invalid channels
 * by overwriting the whitelist memory file afterwards.
 *
 * Should be called before trying to use the whitelist.
 *
 * @param client The current logged-in client
 * @throws If the memory file is improperly formatted
 */
export async function load (client: Client<true>): Promise<void> {
	// Create the user's memory directory if it does not exist
	const directoryPath = join(getCurrentDirectory(import.meta.url), "..", "..", "memory", client.user.id);
	if (!existsSync(directoryPath)) {
		mkdirSync(directoryPath, { recursive: true });
	}

	// Create the whitelist file if it does not exist
	filePath = join(directoryPath, "whitelist.json");
	if (!existsSync(filePath)) {
		save();
	}

	// Load the whitelist file
	const fileBuffer = readFileSync(filePath);
	const fileStr = fileBuffer.toString();
	const json: unknown = JSON.parse(fileStr);

	// Validate the file formatting
	if (!isValidWhitelistFile(json)) {
		throw new Error(`The whitelist memory file at ${filePath} is not properly formatted.`);
	}

	// Fetch and validate channels (in parallel)
	whitelist.length = 0;
	await Promise.all(
		json.map(
			async channelID => {
				const channel = await fetchAndValidateChannel(channelID, client);
				if (channel) {
					whitelist.push(channel);
				}
			},
		),
	);

	// Overwrite memory file if there were any invalid channel IDs
	if (whitelist.length < json.length) {
		warn("Removing invalid channels from whitelist");
		warn();
		save();
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
 * Fetches the given channel from the Discord API and validates it.
 *
 * @returns The channel, or undefined if the channel could not be found or is invalid
 */
async function fetchAndValidateChannel (channelID: Snowflake, client: Client): Promise<TextBasedChannel | undefined> {
	// Test access
	let channel: Channel | null;
	try {
		channel = await client.channels.fetch(channelID);
	}
	catch (error) {
		if (!(error instanceof Error)) {
			throw error;
		}

		if (error.message === "Unknown Channel") {
			warn(`Found unknown channel in the whitelist with ID ${channelID}`);
		}
		else if (error.message === "Missing Access") {
			warn(`Found restricted channel in the whitelist with ID ${channelID}`);
		}
		return undefined;
	}
	if (!channel) {
		warn(`Could not find channel in the whitelist with ID ${channelID}`);
		return undefined;
	}

	// Validate channel type
	if (!isTextBasedChannel(channel)) {
		warn(`Found channel of invalid type ${channel.constructor.name} in whitelist with ID ${channelID}`);
		return undefined;
	}

	// Test message-reading permissions
	try {
		await channel.messages.fetch({ limit: 1 });
	}
	catch (error) {
		if (!(error instanceof Error)) {
			throw error;
		}

		if (error.message === "Missing Access") {
			warn(`Found restricted channel in the whitelist with ID ${channelID}`);
		}
		return undefined;
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
	const ids = getWhitelist().map(channel => channel.id);
	writeFileSync(filePath, JSON.stringify(ids));
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
