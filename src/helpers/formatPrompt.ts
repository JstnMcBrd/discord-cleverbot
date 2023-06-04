import type { Message } from "discord.js";

import { isAMention } from "./messageAnalysis.js";

/**
 * // TODO
 */
export function formatPrompt (message: Message): string {
	const user = message.client.user;
	let content = message.cleanContent;

	if (isAMention(message, user)) {
		content = replaceMentions(user.username, content);
	}
	content = replaceCustomEmojis(content);
	content = content.trim();

	return content;
}

/**
 * Replaces @ mentions of the user with 'Cleverbot' to avoid confusing the Cleverbot AI
 */
function replaceMentions (username: string, content: string): string {
	return content.replaceAll(`@${username}`, "Cleverbot");
}

/**
 * Replaces unknown discord emojis with the name of the emoji as *emphasized* text to avoid confusing the Cleverbot AI.
 *
 * Example: `<:test_emoji:999999999999999999>` => `*test emoji*`
 */
function replaceCustomEmojis (content: string): string {
	content = content.replaceAll(/<:[\w\W][^:\s]+:\d+>/g, match => {
		match = match.replace("<:", "");
		match = match.replace(/:\d+>/g, "");
		match = match.replace("_", " ");
		return `*${match}*`;
	});
	return content;
}
