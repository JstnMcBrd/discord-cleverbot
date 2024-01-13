import type { Message } from 'discord.js';

/**
 * @returns The content of the message, formatted for Cleverbot to understand
 */
export function formatPrompt(message: Message): string {
	let content = message.cleanContent;
	content = replaceMentions(message.client.user.username, content);
	content = content.trim();
	return content;
}

/**
 * Replaces @ mentions of the user with 'Cleverbot' to avoid confusing the Cleverbot AI.
 *
 * @param username The username of the client user
 */
function replaceMentions(username: string, content: string): string {
	return content.replaceAll(`@${username}`, 'Cleverbot');
}
