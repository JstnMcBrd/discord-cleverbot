/*
 * Whitelist Manager
 *
 * The whitelist is the list of channels that the bot is allowed to speak in.
 * This global manager takes care of...
 * - loading the whitelist from memory
 * - adding and removing channels
 * - saving the whitelist to memory
*/

import fs from "node:fs";
import type { Channel, Client } from "discord.js";

/**
 * The file path of the whitelist memory file.
 */
let filePath = "";

/**
 * The local copy of the whitelist.
 */
let whitelist: Array<string> = [];

/**
 * Loads the whitelist from the memory file.
 */
function load(): void {
	whitelist = JSON.parse(fs.readFileSync(filePath).toString()) as Array<string>;
	// TODO clean this up and make it safer for TypeScript
}

/**
 * Verifies that all the channel IDs in the whitelist are accessable and removes invalid channels.
 * Important: the client passed to this method must be logged in to the account that the whitelist is for.
 * @param client a logged-in Discord client to use to access channels
 */
export async function verify(client: Client): Promise<void> {
	for (const channelID of whitelist) {
		// Verify the channel exists / is accessible
		await client.channels.fetch(channelID).catch(error => {
			// If the channel doesn't exist, remove it from the whitelist
			// TODO make this more typescript-safe
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (error.message === "Unknown Channel" || error.message === "Missing Access") {
				removeChannel(channelID);
			}
			// If there's some other kind of error, throw a fit
			else {
				throw error;
			}
		});
	}
}

/**
 * Writes the whitelist to the memory file.
 */
function save(): void {
	fs.writeFileSync(filePath, JSON.stringify(whitelist));
}

/**
 * Sets the account name so the memory file can be loaded.
 * Should be called before trying to use the whitelist.
 * Assumes the account name is valid.
 * @param account a valid account name
 */
export function setAccount(account: string): void {
	filePath = `../accounts/${account}/whitelist.json`;
	load();
}

/**
 * Returns the local copy of the whitelist.
 * @returns the whitelist
 */
export function getWhitelist(): Array<string> {
	return whitelist;
}

/**
 * Used by other methods to standardize their input so they can accept discord.js channels or string channel IDs.
 * @param channel Either a discord.js channel or the channel ID
 * @returns the channel ID
 */
function getChannelID(channel: string|Channel): string {
	if (typeof channel === "string") {
		return channel;
	}
	else {
		return channel.id;
	}
}

/**
 * Adds a channel to the whitelist and saves to the memory file.
 * @param channel Either a discord.js channel or the channel ID
 * @returns true if successful, false if the channel was already in the whitelist
 */
export function addChannel(channel: string|Channel): boolean {
	// Standardize the input
	const channelID = getChannelID(channel);

	// If the channel is not already in the whitelist, add it
	if (!hasChannel(channelID)) {
		whitelist.push(channelID);
		save();
		return true;
	}
	return false;
}

/**
 * Removes a channel from the whitelist and saves to the memory file.
 * @param channel Either a discord.js channel or the channel ID
 * @returns true if successful, false if the whitelist doesn't have the channel
 */
export function removeChannel(channel: string|Channel): boolean {
	// Standardize the input
	const channelID = getChannelID(channel);

	// If the channel is in the whitelist, remove it
	if (hasChannel(channelID)) {
		whitelist.splice(whitelist.indexOf(channelID), 1);
		save();
		return true;
	}
	return false;
}

/**
 * Checks if a channel is in the whitelist.
 * @param channel Either a discord.js channel or the channel ID
 * @returns true if the channel is in the whitelist, false if not
 */
export function hasChannel(channel: string|Channel): boolean {
	// Standardize the input
	const channelID = getChannelID(channel);

	return whitelist.indexOf(channelID) !== -1;
}
