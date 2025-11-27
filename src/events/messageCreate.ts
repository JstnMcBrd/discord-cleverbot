import cleverbot from 'cleverbot-free';
import type { Message, TextBasedChannel } from 'discord.js';
import { PartialGroupDMChannel } from 'discord.js';

import { EventHandler } from './EventHandler.js';
import { formatPrompt } from '../utils/formatPrompt.js';
import { doesMentionSelf, isMarkedAsIgnore, isFromSelf, isEmpty } from '../utils/messageAnalysis.js';
import { replyWithError } from '../utils/replyWithError.js';
import { sleep } from '../utils/sleep.js';
import { addToContext, getContext } from '../memory/context.js';
import { isThinking, startThinking, stopThinking } from '../memory/thinking.js';
import { hasChannel as isWhitelisted } from '../memory/whitelist.js';
import { typingSpeed } from '../parameters.js';
import { debug, error, info } from '../logger.js';

/** The error message to throw if the Cleverbot module returns an empty string. */
const EMPTY_STRING_ERROR_MESSAGE = 'Cleverbot returned an empty string';

/** The error message superagent throws if the HTTP request times out. */
const SUPERAGENT_RESPONSE_TIMEOUT_ERROR_MESSAGE = 'Response timeout of 10000ms exceeded';

/**
 * The error messsage the Cleverbot module throws if it fails after 15 tries.
 * See [cleverbot-free/index.js](../../node_modules/cleverbot-free/index.js).
 */
const CLEVERBOT_MAX_TRIES_ERROR_MESSAGE = 'Failed to get a response after 15 tries.';

/** Called whenever the client observes a new message. */
export const messageCreate = new EventHandler('messageCreate')
	.setOnce(false)
	.setExecution(async (message) => {
		// Ignore certain messages
		if (isFromSelf(message)) {
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
		if (!isWhitelisted(message.channel) && !doesMentionSelf(message)) {
			return;
		}

		try {
			// Prevent bot from responding to anything else in this channel while it thinks
			startThinking(message.channel);

			// Format the prompt and context
			const prompt = formatPrompt(message);
			const context = getContext(message.channel)?.map(formatPrompt);

			// Generate response
			const response = await cleverbot(prompt, context);
			if (response === '') {
				throw new TypeError(EMPTY_STRING_ERROR_MESSAGE);
			}

			logExchange(message.channel, context ?? [], prompt, response);

			// Pause to pretend to 'type' the message
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

			// Allow bot to receive new messages in this channel
			stopThinking(message.channel);
		}
		catch (err) {
			error(err);

			// We need to stop blocking this channel before we can try again
			stopThinking(message.channel);

			// If Cleverbot goofed, try again
			if (err instanceof Error
				&& (err.message === SUPERAGENT_RESPONSE_TIMEOUT_ERROR_MESSAGE
					|| err.message === CLEVERBOT_MAX_TRIES_ERROR_MESSAGE
					|| err.message === EMPTY_STRING_ERROR_MESSAGE)) {
				void messageCreate.execute(message);
			}
			// If unknown error, respond with error message
			else {
				await replyWithError(message, err);
			}
		}
	});

/**
 * Logs the current exchange.
 */
function logExchange(channel: TextBasedChannel, context: string[], prompt: string, response: string): void {
	const prevMessage = context.at(context.length - 1) ?? '';

	info('Generated response');
	debug(`\tChannel: ${
		channel.isDMBased()
			? channel instanceof PartialGroupDMChannel
				? `@${channel.recipients.map(r => r.username).join(',')}`
				: `@${channel.recipient?.username ?? 'unknown user'}`
			: `#${channel.name}`
	} (${channel.id})`);
	debug(`\t... ${prevMessage}`);
	debug(`\t──> ${prompt}`);
	debug(`\t<── ${response}`);
}

/**
 * Sends the given response, either using the channel's `send` method or the message's `reply`
 * method, depending on whether the message is the latest message in the channel.
 *
 * @param message The message to reply to
 * @param response The response to send
 * @returns The response as a `Message` object
 */
async function sendOrReply(message: Message, response: string): Promise<Message> {
	if (message.channel instanceof PartialGroupDMChannel) {
		throw new TypeError('Cannot send messages to a PartialGroupDMChannel');
	}
	return isLatestMessage(message)
		? message.channel.send(response)
		: message.reply(response);
}

/**
 * @returns Whether the given message is the latest message in its channel
 */
function isLatestMessage(message: Message): boolean {
	if (message.channel instanceof PartialGroupDMChannel) {
		return false;
	}
	return message.channel.lastMessageId === message.id;
}
