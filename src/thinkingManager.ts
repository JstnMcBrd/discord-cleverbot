import type { Channel } from "discord.js";

/**
 * Keeps track of which channels the bot is already generating a response for.
 * Don't access directly - use the methods below.
 */
const thinking: string[] = [];

/**
 * Checks to see if the bot is currently generating a response in a channel.
 */
export function isThinking(channel: Channel): boolean {
	return thinking.includes(channel.id);
}

/**
 * Records that the bot is currently generating a response in the channel.
 */
export function startThinking(channel: Channel): void {
	thinking.push(channel.id);
}

/**
 * Records that the bot has finished generating a response in the channel.
 */
export function stopThinking(channel: Channel) {
	const index = thinking.indexOf(channel.id);
	if (index !== -1) {
		thinking.splice(index, 1);
	}
}
