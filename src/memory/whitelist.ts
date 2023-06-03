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

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { DMChannel, NewsChannel, StageChannel, TextChannel, ThreadChannel, VoiceChannel } from "discord.js";
import type { Channel, Client, Snowflake, TextBasedChannel } from "discord.js";

import { getCurrentDirectory } from "../helpers/getCurrentDirectory.js";
import { warn } from "../logger.js";

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
let whitelistAsChannelIDs: Snowflake[] = [];

/**
 * Sets the account name and loads the whitelist from the memory file.
 * Saves the channel IDs for later to be fetched by calling `populate`.
 *
 * Should be called before trying to use the whitelist.
 *
 * @param account a valid account name
 * @throws if the account name is not valid, or if the memory file is improperly formatted
 */
export function loadFrom(account: string): void {
	filePath = join(getCurrentDirectory(import.meta.url), "..", "..", "accounts", account, "whitelist.json");

	// Load the memory file
	const fileBuffer = readFileSync(filePath);
	const fileStr = fileBuffer.toString();
	const json: unknown = JSON.parse(fileStr);

	// Validate the file formatting
	if (Array.isArray(json) && allElementsAreStrings(json)) {
		whitelistAsChannelIDs = json as Snowflake[];
	}
	else {
		throw new Error(`The whitelist memory file at ${filePath} is not properly formatted`);
	}
}

/**
 * Uses the saved list of channel IDs from `loadFrom` and fetches the channels from the Discord API.
 * Validates each channel and removes invalid channels by overwriting the whitelist memory file afterwards.
 *
 * Should be called after calling `loadFrom` and before trying to use the whitelist.
 *
 * Important: the client passed to this method must be logged in to the account that the whitelist is for.
 *
 * @param client a logged-in Discord client to use to fetch channels
 */
export async function populate(client: Client) {
	// Fetch and validate channels
	whitelist = [];
	const invalidChannelIDs: Snowflake[] = [];
	for (const channelID of whitelistAsChannelIDs) {
		const channel = await fetchAndValidateChannel(channelID, client);
		if (channel !== undefined) {
			whitelist.push(channel);
		}
		else {
			invalidChannelIDs.push(channelID);
		}
	}

	// Overwrite memory file if there were any invalid channel IDs
	if (invalidChannelIDs.length > 0) {
		warn(`Removing invalid channels from whitelist: ${invalidChannelIDs.toString()}`);
		warn();
		save();
	}
}

/**
 * @returns whether the given array only consists of strings
 */
function allElementsAreStrings(array: Array<unknown>): boolean {
	return array.every(value => typeof value === "string");
}

/**
 * Fetches the given channel from the Discord API and validates it.
 *
 * @returns the channel, or undefined if the channel could not be found or is invalid
 */
async function fetchAndValidateChannel(channelID: Snowflake, client: Client): Promise<TextBasedChannel | undefined> {
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
 * @returns whether the given channel is a text-based channel
 */
function isTextBasedChannel(channel: Channel): channel is TextBasedChannel {
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
 * @returns a read-only copy of the whitelist
 */
export function getWhitelist(): readonly TextBasedChannel[] {
	return whitelist;
}

/**
 * Writes the whitelist channel IDs to the memory file.
 */
function save(): void {
	whitelistAsChannelIDs = getWhitelist().map(channel => channel.id);
	writeFileSync(filePath, JSON.stringify(whitelistAsChannelIDs));
}

/**
 * Adds a channel to the whitelist and saves the memory file.
 *
 * @param channel the channel to whitelist
 * @returns true if successful, false if the channel was already in the whitelist
 */
export function addChannel(channel: TextBasedChannel): boolean {
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
 * @param channel the channel to unwhitelist
 * @returns true if successful, false if the whitelist doesn't have the channel
 */
export function removeChannel(channel: TextBasedChannel): boolean {
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
 * @param channel the channel to check
 * @returns true if the channel is in the whitelist, false if not
 */
export function hasChannel(channel: TextBasedChannel): boolean {
	return whitelist.indexOf(channel) !== -1;
}
