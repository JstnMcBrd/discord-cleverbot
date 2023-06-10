import cleverbot from "cleverbot-free";
import type { Message } from "discord.js";

import { EventHandler } from "./EventHandler.js";
import { indent } from "../helpers/indent.js";
import { formatPrompt } from "../helpers/formatPrompt.js";
import { isMarkedAsIgnore, isFromUser, isEmpty, isAMention } from "../helpers/messageAnalysis.js";
import { replyWithError } from "../helpers/replyWithError.js";
import { addToContext, generateContext, getContextAsFormattedPrompts, hasContext, removeLastMessageFromContext } from "../memory/context.js";
import { isThinking, startThinking, stopThinking } from "../memory/thinking.js";
import { hasChannel as isWhitelisted } from "../memory/whitelist.js";
import { debug, error, info, warn } from "../logger.js";
import { typingSpeed } from "../parameters.js";

/** The error message to throw if the Cleverbot module returns an empty string. */
const EMPTY_STRING_ERROR_MESSAGE = "Cleverbot returned an empty string";

/** The error message the superagent throws if the HTTP request times out. */
const RESPONSE_TIMEOUT_ERROR_MESSAGE = "Response timeout of 10000ms exceeded";

/**
 * The error messsage the Cleverbot module throws if it fails after 15 tries.
 * See [cleverbot-free/index.js](../../node_modules/cleverbot-free/index.js)
*/
const MAX_TRIES_ERROR_MESSAGE = "Failed to get a response after 15 tries";

/** Called whenever the discord.js client observes a new message. */
export const messageCreate = new EventHandler("messageCreate")
	.setOnce(false)
	.setExecution(async function (message: Message): Promise<void> {
		const client = message.client;

		// Ignore messages if they are...
		// ... from the user
		if (isFromUser(message, client.user)) {
			return;
		}
		// ... empty (images, embeds, interactions)
		if (isEmpty(message)) {
			return;
		}
		// ... marked as ignore
		if (isMarkedAsIgnore(message)) {
			return;
		}
		// ... in a channel already responding to
		if (isThinking(message.channel)) {
			return;
		}
		// ... not whitelisted or forced reply
		if (!isWhitelisted(message.channel) && !isAMention(message, client.user)) {
			return;
		}

		info("Received new message");
		debug(indent(debugMessage(message), 1));

		// Format the prompt
		info("Formatting prompt");
		const prompt = formatPrompt(message);
		debug(indent(`Prompt: ${prompt}`, 1));

		// Generate or update conversation context (but only for whitelisted channels)
		// TODO is this necessary anymore?
		if (isWhitelisted(message.channel) && !hasContext(message.channel)) {
			info("Generating new channel context");
			await generateContext(message.channel, client);
			removeLastMessageFromContext(message.channel);
		}

		// Prevent bot from responding to anything else while it thinks
		startThinking(message.channel);

		// Actually generate response
		info("Generating response");
		cleverbot(prompt, getContextAsFormattedPrompts(message.channel)).then(response => {
			// Sometimes cleverbot goofs and returns an empty response
			if (response === "") {
				throw new TypeError(EMPTY_STRING_ERROR_MESSAGE);
			}

			info("Generated response successfully");
			debug(`\tResponse: ${response}`);

			// Determine how long to show the typing indicator before sending the message (seconds)
			const timeTypeSec = response.length / typingSpeed;
			void message.channel.sendTyping();
			// Will automatically stop typing when message sends

			info("Sending message");

			function respond () {
				let messagePromise: Promise<Message>;

				// Respond normally if no extra messages have been sent in the meantime
				if (message.channel.lastMessageId === message.id) {
					messagePromise = message.channel.send(response);
				}
				// Use reply if other messages are in the way
				else {
					messagePromise = message.reply(response);
				}

				messagePromise.then(responseMessage => {
					info("Sent message successfully");

					// Update conversation context (but only for whitelisted channels)
					if (isWhitelisted(message.channel)) {
						info("Updating channel context");
						addToContext(message.channel, message);
						addToContext(message.channel, responseMessage);
					}

					info();
				}).catch(err => {
					error(err);
					warn("Failed to send message");
				});

				// Allow bot to think about new messages now
				stopThinking(message.channel);
			}

			// Send the message once the typing time is over
			setTimeout(respond, timeTypeSec * 1000);
		}).catch(err => {
			// Stop thinking so bot can respond in future
			stopThinking(message.channel);

			// Log the error
			error(err);
			warn("Failed to generate response");

			// If error is timeout, then try again
			const errorMessage: string|unknown = err instanceof Error ? err.message : err;

			if (errorMessage === RESPONSE_TIMEOUT_ERROR_MESSAGE
				|| errorMessage === MAX_TRIES_ERROR_MESSAGE
				|| errorMessage === EMPTY_STRING_ERROR_MESSAGE) {
				info("Trying again");
				info();
				void messageCreate.execute(message);
			}
			// If unknown error, then respond to message with error message
			else {
				info("Replying with error message");
				info();
				void replyWithError(message, error);
			}
		});
	});

/**
 * Formats important information about a message to a string.
 */
function debugMessage (message: Message): string {
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
