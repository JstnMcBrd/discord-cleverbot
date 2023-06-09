/**
 * This manager keeps track of which channels the bot is already generating a message for, so the
 * bot doesn't reply to several messages at the same time.
 */

import type { Channel, Snowflake } from "discord.js";

/** Keeps track of which channels the bot is already generating a response for. */
const thinking: Snowflake[] = [];

/**
 * @returns Whether the bot is currently generating a response in the given channel
 */
export function isThinking (channel: Channel): boolean {
	return thinking.includes(channel.id);
}

/**
 * Records that the bot is currently generating a response in the given channel.
 */
export function startThinking (channel: Channel): void {
	thinking.push(channel.id);
}

/**
 * Records that the bot has finished generating a response in the given channel.
 */
export function stopThinking (channel: Channel) {
	const index = thinking.indexOf(channel.id);
	if (index !== -1) {
		thinking.splice(index, 1);
	}
}
