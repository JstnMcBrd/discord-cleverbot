import { ActivityType } from "discord.js";
import type { ActivityOptions, Client } from "discord.js";

import { error, info, warn } from "../logger.js";

/**
 * How often to update the activity (in seconds).
 */
const activityUpdateFrequency = 5 * 60;

/**
 * The activity the bot should use.
 */
const activityOptions: ActivityOptions = {
	name: "/help",
	type: ActivityType.Listening,
	url: "https://www.cleverbot.com/",
};
// Wait until Discord supports custom statuses for bots
//
// const activityOptions: ActivityOptions = {
// 	name: "Use /help",
// 	details: "Use /help",
// 	emoji: {
// 		name: "robot"
// 	},
// 	type: Discord.ActivityType.Custom,
// 	url: "https://www.cleverbot.com/""
// };

/**
 * Keeps the user activity of the bot regularly updated.
 */
export function start (client: Client): void {
	info("Setting user activity...");
	try {
		setActivity(client);
	}
	catch (err) {
		error(err);
		warn("Failed to set user activity");
	}

	// Set user activity at regular intervals
	setTimeout(start, activityUpdateFrequency * 1000, client);
	info(`Setting again in ${activityUpdateFrequency} seconds`);
	info();
}

/**
 * Sets the activity of the bot.
 */
function setActivity (client: Client): void {
	if (!client.user) {
		throw new TypeError("Client must be logged in");
	}

	const presence = client.user.setActivity(activityOptions);

	// Double check to see if it worked
	// This currently always returns true, but discord.js doesn't have a better way to check
	const activity = presence.activities[0];
	let correct = false;
	if (activity !== undefined) {
		correct = activity.name === activityOptions.name &&
			activity.type === activityOptions.type &&
			activity.url === activityOptions.url;
	}
	if (!correct) {
		throw new Error("Client presence did not update correctly");
	}
}
