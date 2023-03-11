import { CategoryChannel, Client, Message, PartialGroupDMChannel, StageChannel, TextBasedChannel } from "discord.js";

import type { EventHandler } from "../@types/EventHandler";
import * as logger from "../logger";
import { logEventError } from "./";
import { messageCreate } from "./messageCreate";
import { verify as verifyWhitelist, getWhitelist } from "../memory/whitelist";
import { isFromUser } from "../helpers/messageAnalyzer";
import { start as manageActivity } from "../helpers/activityManager";
import { generateContext, getContext } from "../memory/context";

/**
 * How often to look for missed messages (in seconds).
 */
const missedMessageSearchFrequency = 30 * 60;

export const ready: EventHandler<"ready"> = {
	name: "ready",
	once: true,
	async execute(client: Client) {
		try {
			await onceReady(client);
		}
		catch (error) {
			logEventError(this.name, error);
		}
	},
};

/**
 * Called once the client successfully logs in.
 */
async function onceReady(client: Client): Promise<void> {
	logger.info("Client ready");
	logger.info();

	manageActivity(client);

	// Unlike setUserActivity and resumeConversations, verifyWhitelist will not repeat after startup
	await verifyWhitelist(client);
	await initializeContext(client);
	await resumeConversations(client);
}

/**
 * // TODO make typescript-safe
 * // TODO jsdoc
 */
async function initializeContext(client: Client) {
	for (const channelID of getWhitelist()) {
		const channel = await client.channels.fetch(channelID);
		await generateContext(client, channel as TextBasedChannel);
	}
}

/**
 * Searchs for unread messages in whitelisted channels that were sent when the bot was offline, and responds to them.
 */
async function resumeConversations(client: Client): Promise<void> {
	// Verify the whitelist first every time
	// TODO This is a temporary solution
	await verifyWhitelist(client);

	logger.info("Searching for missed messages...");

	const toRespondTo: Message[] = [];
	for (const channelID of getWhitelist()) {
		// Fetch the channel
		const channel = await client.channels.fetch(channelID);

		if (!channel) continue;
		if (channel instanceof CategoryChannel) continue;
		if (channel instanceof StageChannel) continue;
		if (channel instanceof PartialGroupDMChannel) continue;

		// Get the context
		const context = getContext(channel);
		if (!context) continue;

		// Get the last message
		const lastMessage = context[context.length - 1];
		if (!lastMessage) continue;

		// If the last message isn't from the bot, then respond to it
		if (!isFromUser(lastMessage, client.user)) {
			toRespondTo.push(lastMessage);
		}
	}

	// Respond to missed messages
	if (toRespondTo.length !== 0) {
		logger.info(`\tFound ${toRespondTo.length} missed messages`);
		logger.info("\tForwarding messages to message handler");
		logger.info();
		toRespondTo.forEach(message => void messageCreate.execute(message));
	}

	// Check for missed messages at regular intervals
	setTimeout(() => void resumeConversations(client), missedMessageSearchFrequency * 1000);
	logger.info(`Searching again in ${missedMessageSearchFrequency} seconds`);
	logger.info();
}
