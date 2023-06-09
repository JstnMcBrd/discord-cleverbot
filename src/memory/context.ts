/**
 * This manager records past messages in each chat, so the Cleverbot API can understand the past
 * conversation context when generating a new reply.
 */

import type { Channel, Client, Message, Snowflake, TextBasedChannel } from "discord.js";

import { whitelist as whitelistCommand } from "../commands/whitelist.js";
import { isEmpty, isFromUser, isMarkedAsIgnore } from "../helpers/messageAnalysis.js";
import { formatPrompt } from "../helpers/formatPrompt.js";

/** Keeps track of the past conversation for each channel. Maps channelID to lists of messages. */
const context = new Map<Snowflake, Message[]>;

/** Limits the length of each channel's context so memory isn't overburdened. */
const maxContextLength = 50;

/**
 * @returns The past messages of the given channel, or undefined
 */
export function getContext (channel: Channel): Message[]|undefined {
	return context.get(channel.id);
}

/**
 * @returns The past messages of the given channel as formatted prompts, or undefined
 */
export function getContextAsFormattedPrompts (channel: Channel): string[]|undefined {
	return getContext(channel)?.map(formatPrompt);
}

/**
 * @returns Whether the past messages of the given channel have been recorded yet
 */
export function hasContext (channel: Channel): boolean {
	return context.has(channel.id);
}

/**
 * Fetches and stores the past messages of the given channel.
 *
 * @param channel The channel to fetch messages from
 * @param client The current logged-in client
 */
export async function generateContext (channel: TextBasedChannel, client: Client<true>): Promise<void> {
	const newContext: Message[] = [];

	const messages = await channel.messages.fetch({ limit: maxContextLength });

	let done = false;
	messages.forEach(message => {
		// Do not generate context from before the channel was whitelisted
		if (done) {
			return;
		}
		if (isEmpty(message) && isFromUser(message, client.user)) {
			if (message.interaction !== null && message.interaction.commandName === whitelistCommand.name) {
				done = true;
				return;
			}
		}

		// Skip empty messages and ignored messages
		if (isEmpty(message)) {
			return;
		}
		if (isMarkedAsIgnore(message)) {
			return;
		}

		// If there are two messages from other users in a row, skip the most recent one (like the bot normally would)
		if (newContext[0] !== undefined && !isFromUser(message, client.user) && !isFromUser(newContext[0], client.user)) {
			newContext.shift();
		}

		// DO NOT take message replies into account.
		// While it could be useful to follow reply chains to map out a conversation,
		// there is no guarantee that a reply message points to the other user
		// and doesn't skip other valid messages.

		newContext.unshift(message);
	});

	context.set(channel.id, newContext);
}

/**
 * Deletes the past messages of the given channel from the records.
 */
export function deleteContext (channel: Channel): void {
	if (!hasContext(channel)) {
		return;
	}

	context.delete(channel.id);
}

/**
 * Adds the given message to the recorded past messages of the given channel.
 */
export function addToContext (channel: Channel, message: Message): void {
	if (!hasContext(channel)) {
		return;
	}

	const updatedContext = getContext(channel);
	if (!updatedContext) {
		return;
	}

	updatedContext.push(message);
	// Make sure context doesn't go over the max length
	if (updatedContext.length > maxContextLength) {
		updatedContext.shift();
	}

	context.set(channel.id, updatedContext);
}

/**
 * Removes the most recent message from the recorded past messages of the given channel.
 */
export function removeLastMessageFromContext (channel: Channel): void {
	if (!hasContext(channel)) {
		return;
	}

	const updatedContext = getContext(channel);
	if (!updatedContext) {
		return;
	}

	updatedContext.pop();

	context.set(channel.id, updatedContext);
}
