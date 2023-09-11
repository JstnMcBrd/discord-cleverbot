/**
 * Keeps track of which channels the bot is already generating a message for, so the
 * bot doesn't reply to several messages in the same channel at the same time.
 */

import type { Channel, Snowflake } from "discord.js";

/**
 * Maps channel IDs to Node timeout objects that will automatically remove them from the map.
 */
const thinking = new Map<Snowflake, NodeJS.Timeout>;

/**
 * How long a channel can be marked as "thinking" before being unmarked to prevent it from being
 * blocked indefinitely (in seconds).
 */
const thinkingTimeout = 30;

/**
 * @returns Whether the bot is currently generating a response in the given channel
 */
export function isThinking (channel: Channel): boolean {
	return thinking.has(channel.id);
}

/**
 * Records that the bot is currently generating a response in the given channel, or restarts
 * the timeout if it is already in the list.
 */
export function startThinking (channel: Channel): void {
	if (!isThinking(channel)) {
		const timeout = setTimeout(() => {
			stopThinking(channel);
		}, thinkingTimeout * 1000);
		thinking.set(channel.id, timeout);
	}
	thinking.get(channel.id)?.refresh();
}

/**
 * Records that the bot has finished generating a response in the given channel.
 */
export function stopThinking (channel: Channel) {
	thinking.delete(channel.id);
}
