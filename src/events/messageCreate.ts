import type { Message } from "discord.js";
import cleverbot from "cleverbot-free";

import type { EventHandler } from "../@types/EventHandler";
import * as logger from "../logger";
import { indent } from "../helpers/indent";
import { typingSpeed } from "../parameters";
import { logEventError } from ".";
import { addToContext, generateContext, getContext, hasContext, removeLastMessageFromContext } from "../memory/context";
import { isThinking, startThinking, stopThinking } from "../memory/thinking";
import { hasChannel as isWhitelisted } from "../memory/whitelist";
import { isMarkedAsIgnore, isFromUser, isEmpty, isAMention } from "../helpers/messageAnalyzer";
import { replyWithError } from "../helpers/replyWithError";
import { replaceMentions } from "../helpers/replaceMentions";
import { replaceUnknownEmojis } from "../helpers/replaceUnknownEmojis";

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
