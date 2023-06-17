import cleverbot from "cleverbot-free";
import type { Message, TextBasedChannel } from "discord.js";

import { EventHandler } from "./EventHandler.js";
import { formatPrompt } from "../utils/formatPrompt.js";
import { isMarkedAsIgnore, isFromUser, isEmpty, isAMention } from "../utils/messageAnalysis.js";
import { replyWithError } from "../utils/replyWithError.js";
import { sleep } from "../utils/sleep.js";
import { addToContext, getContext } from "../memory/context.js";
import { isThinking, startThinking, stopThinking } from "../memory/thinking.js";
import { hasChannel as isWhitelisted } from "../memory/whitelist.js";
import { typingSpeed } from "../parameters.js";
import { debug, error, info } from "../logger.js";

/** The error message to throw if the Cleverbot module returns an empty string. */
const EMPTY_STRING_ERROR_MESSAGE = "Cleverbot returned an empty string";

/** The error message superagent throws if the HTTP request times out. */
const SUPERAGENT_RESPONSE_TIMEOUT_ERROR_MESSAGE = "Response timeout of 10000ms exceeded";

/**
 * The error messsage the Cleverbot module throws if it fails after 15 tries.
 * See [cleverbot-free/index.js](../../node_modules/cleverbot-free/index.js)
 */
const CLEVERBOT_MAX_TRIES_ERROR_MESSAGE = "Failed to get a response after 15 tries.";

/** Called whenever the discord.js client observes a new message. */
export const messageCreate = new EventHandler("messageCreate")
	.setOnce(false)
	.setExecution(async message => {
		// Ignore certain messages
		if (isFromUser(message, message.client.user)) {
			return;
		}
		if (isEmpty(message)) {
			return;
		}
		if (isMarkedAsIgnore(message)) {
			return;
		}
		if (isThinking(message.channel)) {
			return;
		}
		if (!isWhitelisted(message.channel) && !isAMention(message, message.client.user)) {
			return;
		}

		try {
			// Prevent bot from responding to anything else while it thinks
			startThinking(message.channel);

			// Format the prompt and context
			const prompt = formatPrompt(message);
			const context = getContext(message.channel)?.map(formatPrompt);

			// Generate response
			const response = await cleverbot(prompt, context);
			if (response === "") {
				throw new TypeError(EMPTY_STRING_ERROR_MESSAGE);
			}
			logResponse(message.channel, prompt, response);

			// Pause to pretend to "type" the message
			const timeTypeSec = response.length / typingSpeed;
			await message.channel.sendTyping();
			await sleep(timeTypeSec * 1000);

			// Send the message
			const responseMessage = await sendOrReply(message, response);

			// Update conversation context
			if (isWhitelisted(message.channel)) {
				addToContext(message.channel, message);
				addToContext(message.channel, responseMessage);
			}

			// Allow bot to receive new messages now
			stopThinking(message.channel);
		}
		catch (err) {
			error(err);

			stopThinking(message.channel);

			// If cleverbot goofed, then try again
			if (err instanceof Error
				&& (err.message === SUPERAGENT_RESPONSE_TIMEOUT_ERROR_MESSAGE
					|| err.message === CLEVERBOT_MAX_TRIES_ERROR_MESSAGE
					|| err.message === EMPTY_STRING_ERROR_MESSAGE)) {
				void messageCreate.execute(message);
			}
			// If unknown error, then respond with error message
			else {
				await replyWithError(message, err);
			}
		}
	});

/**
 * Logs the given channel, prompt, and response.
 */
function logResponse (channel: TextBasedChannel, prompt: string, response: string): void {
	info("Generated response");
	debug(`\tChannel: ${
		channel.isDMBased()
			? `@${channel.recipient?.username ?? "unknown user"}`
			: `#${channel.name}`
	} (${channel.id})`);
	debug(`\tPrompt: ${prompt}`);
	debug(`\tResponse: ${response}`);
}

/**
 * Sends the given response, either using the channel's `send` method or the message's `reply`
 * method, depending on whether the message is the latest message in the channel.
 *
 * @param message The message to reply to
 * @param response The response to send
 * @returns The response as a `Message` object
 */
async function sendOrReply (message: Message, response: string): Promise<Message> {
	// Use reply if message is not the latest message
	return isLatestMessage(message)
		? message.channel.send(response)
		: message.reply(response);
}

/**
 * @returns Whether the given message is the latest message in its channel
 */
function isLatestMessage (message: Message): boolean {
	return message.channel.lastMessageId === message.id;
}
