import { ActivityOptions, CategoryChannel, Client, PartialGroupDMChannel, StageChannel } from "discord.js";
import { ActivityType } from "discord.js";

import type { EventHandler } from "../@types/EventHandler";
import * as logger from "../logger";
import { logEventError } from "./";
import { messageCreate } from "./messageCreate";
import { verify as verifyWhitelist, getWhitelist } from "../whitelistManager";
import { isMarkedAsIgnore, isEmpty, isFromUser } from "../helpers/messageAnalyzer";

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

	setUserActivity(client);

	// Unlike setUserActivity and resumeConversations, verifyWhitelist will not repeat after startup
	await verifyWhitelist(client);

	await resumeConversations(client);
}

/**
 * Sets the activity of the bot to be 'Listening to /help'
 */
function setUserActivity(client: Client): void {
	// How long to wait before trying again (seconds)
	const repeatWait = 5 * 60;

	// Wait until Discord supports custom statuses for bots
	/*
	const activityOptions: ActivityOptions = {
		name: "Use /help",
		details: "Use /help",
		emoji: {
			name: "robot"
		},
		type: Discord.ActivityType.Custom,
		url: "https://www.cleverbot.com/""
	}
	*/
	// Use this in the meantime
	const activityOptions: ActivityOptions = {
		name: "/help",
		type: ActivityType.Listening,
		url: "https://www.cleverbot.com/",
	};

	// Set the user's activity
	logger.info("Setting user activity");
	const presence = client.user?.setActivity(activityOptions);

	// Double check to see if it worked
	// This currently always returns true, but discord.js doesn't have a better way to check
	const activity = presence?.activities[0];
	let correct = false;
	if (activity !== undefined) {
		correct = activity.name === activityOptions.name &&
			activity.type === activityOptions.type &&
			activity.url === activityOptions.url;
	}
	if (correct)	logger.info("Set user activity successfully");
	else 			logger.warn("Failed to set user activity");

	// Set user activity at regular intervals
	setTimeout(setUserActivity, repeatWait * 1000, client);
	logger.info(`Setting again in ${repeatWait} seconds`);
	logger.info();
}

/**
 * Searchs for unread messages in whitelisted channels that were sent when the bot was offline, and responds to them.
 */
async function resumeConversations(client: Client): Promise<void> {
	// How long to wait before trying again (seconds)
	const repeatWait = 30 * 60;
	const messageSearchDepth = 10;

	// Verify the whitelist first every time
	// TODO This is a temporary solution
	await verifyWhitelist(client);

	logger.info("Searching for missed messages");
	const toRespondTo = [];
	for (const channelID of getWhitelist()) {

		// Fetch the channel
		const channel = await client.channels.fetch(channelID);

		if (!channel) continue;
		if (channel instanceof CategoryChannel) continue;
		if (channel instanceof StageChannel) continue;
		if (channel instanceof PartialGroupDMChannel) continue;

		// Request the most recent messages of the channel
		const messagesMap = await channel.messages.fetch({ limit: messageSearchDepth });

		// Convert map to array
		const messages = messagesMap.first(messagesMap.size);

		if (!messages) continue;
		if (!(messages instanceof Array)) continue;

		// Search for messages that haven't been replied to
		for (const message of messages) {
			if (isEmpty(message) || isMarkedAsIgnore(message)) continue;
			if (!client.user || !isFromUser(message, client.user)) toRespondTo.push(message);
			break;
		}
	}
	if (toRespondTo.length !== 0) {
		logger.info(`\tFound ${toRespondTo.length} missed messages`);
	}
	logger.info("Searched for missed messages successfully");

	// Check for missed messages at regular intervals
	setTimeout(() => resumeConversations, repeatWait * 1000, client);
	logger.info(`Searching again in ${repeatWait} seconds`);

	// Respond to missed messages
	if (toRespondTo.length !== 0) {
		logger.info("Forwarding messages to message handler");
		logger.info();
		toRespondTo.forEach(message => void messageCreate.execute(message));
	}
	else {
		logger.info();
	}
}
