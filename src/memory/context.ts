/**
 * Context Manager
 *
 * This manager records past messages in each chat, so the cleverbot API
 * can understand the past conversation context when generating a new reply.
 */

import { cleanUpMessage } from "../helpers/cleanUpMessage";
import type { Channel, Client, Collection, Message, Snowflake, TextBasedChannel } from "discord.js";

import { isEmpty, isFromUser, isMarkedAsIgnore } from "../helpers/messageAnalyzer";

/**
 * Keeps track of the past conversation for each channel.
 * Maps channelID to lists of messages.
 * Don't access directly - use the methods below.
 */
const context = new Map<Snowflake, Message[]>;

/**
 * Limits the length of each channel's context so memory isn't overburdened.
 */
const maxContextLength = 50;

/**
 * @returns the past messages of the channel
 */
export function getContext(channel: Channel): Message[]|undefined {
	return context.get(channel.id);
}

/**
 * @returns the past messages of the channel as strings
 */
export function getContextAsStrings(channel: Channel): string[]|undefined {
	return getContext(channel)?.map(message => message.content);
}

/**
 * Checks whether the past messages of the channel have been recorded yet.
 */
export function hasContext(channel: Channel): boolean {
	return context.has(channel.id);
}

/**
 * Fetches and records the past messages of the channel.
 */
export async function generateContext(client: Client, channel: TextBasedChannel) {
	const newContext: Message[] = [];
	let repliedTo: string|undefined = undefined;

	// Fetch past messages
	const messages = await channel.messages.fetch({ limit: maxContextLength }) as Collection<string, Message>;
	messages.each(message => {
		// Skip ignored messages and empty messages
		if (isEmpty(message) || isMarkedAsIgnore(message)) return;
		// Skip messages that bot skipped in the past
		if (!isFromUser(message, client.user) && repliedTo !== undefined && message.id !== repliedTo) return;

		// Clean up message
		message = cleanUpMessage(message);

		// If there are two messages from other users in a row, make them the same message so cleverbot doesn't get confused
		if (newContext[0] !== undefined && !isFromUser(message, client.user) && !isFromUser(newContext[0], client.user)) {
			newContext[0].content = `${message.content}\n${newContext[0].content}`;
		}
		else {
			newContext.unshift(message);
		}

		// If the message is from self, and it replies to another message,
		// record what that message is so we can skip all the ignored messages in between (see above)
		if (message.id === repliedTo) {
			// Reset for the future
			repliedTo = undefined;
		}
		if (isFromUser(message, client.user) && message.reference !== null) {
			if (message.reference.messageId !== undefined) {
				repliedTo = message.reference.messageId;
			}
		}
	});

	context.set(channel.id, newContext);
	return newContext;
}

/**
 * Adds a message to the recorded past messages of a channel.
 */
export function addToContext(channel: Channel, message: Message): void {
	if (!hasContext(channel)) return;

	// To make typescript happy
	const updatedContext = getContext(channel);
	if (!updatedContext) return;

	updatedContext.push(message);
	// Make sure context doesn't go over the max length
	if (updatedContext.length > maxContextLength) {
		updatedContext.shift();
	}

	context.set(channel.id, updatedContext);
}

/**
 * Removes the most recent message from the recorded past messages of a channel.
 */
export function removeLastMessageFromContext(channel: Channel): void {
	if (!hasContext(channel)) return;

	// To make typescript happy
	const updatedContext = getContext(channel);
	if (!updatedContext) return;

	updatedContext.pop();

	context.set(channel.id, updatedContext);
}
