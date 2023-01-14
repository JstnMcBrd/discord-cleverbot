import type { Channel, Client, Collection, Message, TextBasedChannel } from "discord.js";
import cleverbot from "cleverbot-free";

import type { EventHandler } from "../@types/EventHandler";
import * as logger from "../logger";
import { indent } from "../helpers/indent";
import { typingSpeed } from "../parameters";
import { logEventError } from ".";
import { hasChannel as isWhitelisted } from "../whitelistManager";
import { isMarkedAsIgnore, isFromUser, isEmpty, isAMention } from "../helpers/messageAnalyzer";
import { replyWithError } from "../helpers/replyWithError";

export const messageCreate: EventHandler<"messageCreate"> = {
	name: "messageCreate",
	once: false,
	async execute(message: Message) {
		try {
			await onMessage(message);
		}
		catch (error) {
			logEventError(this.name, error);
		}
	},
};

/**
 * Called whenever the discord.js client observes a new message.
 */
async function onMessage(message: Message) {
	const client = message.client;

	// Ignore messages if they are...
	// ... from the user
	if (isFromUser(message, client.user)) return;
	// ... empty (images, embeds, interactions)
	if (isEmpty(message)) return;
	// ... marked as ignore
	if (isMarkedAsIgnore(message)) return;
	// ... in a channel already responding to
	if (isThinking(message.channel)) return;
	// ... not whitelisted or forced reply
	if (!isWhitelisted(message.channel) && !isAMention(message, client.user)) return;

	logger.info("Received new message");
	logger.debug(indent(debugMessage(message), 1));

	// Clean up message, also used in generateContext()
	logger.info("Cleaning up message");
	let input = message.cleanContent;
	if (isAMention(message, client.user)) {
		input = replaceMentions(client.user.username, input);
	}
	input = replaceUnknownEmojis(input);
	input = input.trim();
	logger.info(indent(`Content: ${input}`, 1));

	// Generate or update conversation context (but only for whitelisted channels)
	if (isWhitelisted(message.channel)) {
		if (!hasContext(message.channel)) {
			logger.info("Generating new channel context");
			await generateContext(client, message.channel);
		}
		else {
			logger.info("Updating channel context");
			addToContext(message.channel, input);
		}
	}
	else {
		logger.info("Skipping channel context generation");
	}

	// Prevent bot from responding to anything else while it thinks
	startThinking(message.channel);

	// Actually generate response
	logger.info("Generating response");
	cleverbot(input, getContext(message.channel)).then(response => {
		// Sometimes cleverbot goofs and returns an empty response
		if (response === "") {
			const error = new Error();
			error.name = "Invalid Cleverbot Response";
			error.message = "Response is an empty string";
			throw error;
		}

		logger.info("Generated response successfully");
		logger.debug(`\tResponse: ${response}`);

		// Determine how long to show the typing indicator before sending the message (seconds)
		const timeTypeSec = response.length / typingSpeed;
		void message.channel.sendTyping();
		// Will automatically stop typing when message sends

		// Send the message once the typing time is over
		logger.info("Sending message");
		setTimeout(
			function() {
				// Respond normally if no extra messages have been sent in the meantime
				if (message.channel.lastMessageId === message.id) {
					message.channel.send(response).then(() => {
						logger.info("Sent message successfully");
						logger.info();
					}).catch(error => {
						logger.error(error);
						logger.warn("Failed to send message");
					});
				}
				// Use reply to respond directly if extra messages are in the way
				else {
					message.reply(response).then(() => {
						logger.info("Sent reply successfully");
						logger.info();
					}).catch(error => {
						logger.error(error);
						logger.warn("Failed to send reply");
					});
				}

				// Update conversation context (but only for whitelisted channels)
				if (isWhitelisted(message.channel)) {
					addToContext(message.channel, response);
				}

				// Allow bot to think about new messages now
				stopThinking(message.channel);
			},
			timeTypeSec * 1000,
		);
	}).catch(error => {
		// Undo adding to context (but only for whitelisted channels)
		if (isWhitelisted(message.channel)) {
			removeLastMessageFromContext(message.channel);
		}

		// Stop thinking so bot can respond in future
		stopThinking(message.channel);

		// Log the error
		logger.error(error);
		logger.warn("Failed to generate response");

		// If error is timeout, then try again
		let errorMessage: unknown;
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		else {
			errorMessage = error;
		}

		if (errorMessage === "Response timeout of 10000ms exceeded" ||
		errorMessage === "Failed to get a response after 15 tries" ||
		errorMessage === "Response is an empty string") {
			logger.info("Trying again");
			logger.info();
			void messageCreate.execute(message);
		}
		// If unknown error, then respond to message with error message
		else {
			logger.info("Replying with error message");
			logger.info();
			replyWithError(message, error);
		}
	});
}

/**
 * Formats important information about a message to a string.
 */
function debugMessage(message: Message): string {
	let str = "MESSAGE";
	str += `\nContent: ${message.cleanContent}`;
	str += `\nAuthor:  ${message.author.tag} (${message.author.id})`;
	if (!message.channel.isDMBased()) {
		str += `\nChannel: ${message.channel.name} (${message.channel.id})`;
	}
	// Compensate for DMs
	if (message.guild !== null) {
		str += `\nGuild:   ${message.guild.name} (${message.guild.id})`;
	}
	return str;
}

/**
 * Keeps track of whether the bot is already generating a response for each channel.
 * Don't access directly - use the methods below.
 */
const thinking: Record<string, boolean> = {
	// channelID: true/false,
};

/**
 * Checks to see if the bot is currently generating a response in a channel.
 */
function isThinking(channel: Channel): boolean|undefined {
	return thinking[channel.id];
}

/**
 * Records that the bot is currently generating a response in the channel.
 */
function startThinking(channel: Channel): void {
	thinking[channel.id] = true;
}

/**
 * Records that the bot has finished generating a response in the channel.
 */
function stopThinking(channel: Channel) {
	thinking[channel.id] = false;
}

/**
 * Keeps track of the past conversation for each channel.
 * Don't access directly - use the methods below.
 */
const context: Record<string, string[]> = {
	// channelID: ['past','messages']
};
/**
 * Limits the length of each channel's context so memory isn't overburdened.
 */
const maxContextLength = 50;

/**
 * @returns the past messages of the channel
 */
function getContext(channel: Channel): string[]|undefined {
	return context[channel.id];
}

/**
 * Checks whether the past messages of the channel have been recorded yet.
 */
function hasContext(channel: Channel): boolean {
	return context[channel.id] !== undefined;
}

/**
 * Fetches and records the past messages of the channel.
 */
async function generateContext(client: Client, channel: TextBasedChannel) {
	const newContext: string[] = [];
	let repliedTo: string|undefined = undefined;
	let lastMessageFromUser = false;

	// Fetch past messages
	const messages = await channel.messages.fetch({ limit: maxContextLength }) as Collection<string, Message>;
	messages.each(message => {
		// Skip ignored messages and empty messages
		if (isMarkedAsIgnore(message) || isEmpty(message)) return;
		// Skip messages that bot skipped in the past
		if (!isFromUser(message, client.user) && repliedTo !== undefined && message.id !== repliedTo) return;

		// Clean up message, also used in onMessage()
		let input = message.cleanContent;
		if (client.user && isAMention(message, client.user)) input = replaceMentions(client.user.username, input);
		input = replaceUnknownEmojis(input);

		// If there are two messages from other users in a row, make them the same message so cleverbot doesn't get confused
		if (!isFromUser(message, client.user) && !lastMessageFromUser && newContext[0] !== undefined) {
			newContext[0] = input + `\n${newContext[0]}`;
		}
		else {
			newContext.unshift(input);
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

		lastMessageFromUser = isFromUser(message, client.user);
	});

	context[channel.id] = newContext;
	return context[channel.id];
}

/**
 * Adds a message to the recorded past messages of a channel.
 */
function addToContext(channel: Channel, message: string): void {
	if (!hasContext(channel)) return;

	// To make typescript happy
	const updatedContext = context[channel.id];
	if (!updatedContext) return;

	updatedContext.push(message);
	// Make sure context doesn't go over the max length
	if (updatedContext.length > maxContextLength) {
		updatedContext.shift();
	}

	context[channel.id] = updatedContext;
}

/**
 * Removes the most recent message from the recorded past messages of a channel
 */
function removeLastMessageFromContext(channel: Channel): void {
	if (!hasContext(channel)) return;

	// To make typescript happy
	const updatedContext = context[channel.id];
	if (!updatedContext) return;

	updatedContext.pop();

	context[channel.id] = updatedContext;
}

/**
 * Replaces @ mentions of the user with 'Cleverbot' to avoid confusing the Cleverbot AI
 */
function replaceMentions(username: string, content: string): string {
	return content.replaceAll(`@${username}`, "Cleverbot");
}

/**
 * Replaces unknown discord emojis with the name of the emoji as *emphasized* text to avoid confusing the Cleverbot AI
 */
function replaceUnknownEmojis(content: string): string {
	// Start with custom emojis
	content = content.replaceAll(/<:[\w\W][^:\s]+:\d+>/g, match => {
		match = match.replace("<:", "");
		match = match.replace(/:\d+>/g, "");
		match = match.replace("_", " ");
		return `*${match}*`;
	});
	// Now replace any unknown emojis that aren't custom
	content = content.replaceAll(":", "*").replaceAll("_", " ");
	return content;
}
