import type { Message } from 'discord.js';

/**
 * Recognizes when a message is prefixed with '> ', which tells the bot not to respond.
 *
 * @param message The message to parse
 * @returns `true` if the message begins with '> ', `false` if otherwise
 */
export function isMarkedAsIgnore(message: Message): boolean {
	return message.cleanContent.startsWith('> ');
}

/**
 * Recognizes when a message is from the client user.
 *
 * @param message The message whose author to check
 * @returns `true` if the message came from the client user, `false` if otherwise
 */
export function isFromSelf(message: Message): boolean {
	return message.author.id === message.client.user.id;
}

/**
 * Recognizes when a message is empty (mostly likely an image or embed).
 *
 * @param message The message to check
 * @returns `true` if the message has no text content, `false` if otherwise
 */
export function isEmpty(message: Message): boolean {
	return message.cleanContent.length === 0;
}

/**
 * Recognizes when a message @ mentions the client user.
 *
 * @param message The message to check
 * @returns `true` if the message mentions the client user, `false` if otherwise
 */
export function doesMentionSelf(message: Message): boolean {
	return message.mentions.has(message.client.user);
}
