import type { Message, User } from "discord.js";

/**
 * Recognizes when a message is prepended with '> ', which tells the bot not to respond.
 *
 * @param message The message to parse
 * @returns `true` if the message begins with '> ', `false` if otherwise
 */
export function isMarkedAsIgnore (message: Message): boolean {
	return message.cleanContent.startsWith("> ");
}

/**
 * Recognizes when a message is from the specified user.
 *
 * @param message The message whose author to check
 * @param user The user to check if the message came from
 * @returns `true` if the message came from the user, `false` if otherwise
 */
export function isFromUser (message: Message, user: User): boolean {
	return message.author.id === user.id;
}

/**
 * Recognizes when a message is empty (mostly likely an image or embed).
 *
 * @param message The message to check
 * @returns `true` if the message has no text content, `false` if otherwise
 */
export function isEmpty (message: Message): boolean {
	return message.cleanContent === "";
}

/**
 * Recognizes when a message @ mentions the specified user.
 *
 * @param message The message to check
 * @param user The user to see if the message mentions
 * @returns `true` if the message mentions the user, `false` if otherwise
 */
export function isAMention (message: Message, user: User): boolean {
	return message.mentions.has(user);
}
