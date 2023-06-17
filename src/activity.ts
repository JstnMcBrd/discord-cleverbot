/**
 * This manager takes care of keeping the client user's activity regularly updated.
 *
 * This is necessary because after being set, the user's activity eventually expire.
 */

import { ActivityType } from "discord.js";
import type { ActivityOptions, Client } from "discord.js";

import { error, info } from "./logger.js";

/** How often to update the activity (in seconds). */
const activityUpdateFrequency = 5 * 60;

/** The activity the bot should use. */
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
 *
 * @param client The current logged-in client
 */
export function start (client: Client): void {
	info("Updating activity...");

	try {
		setActivity(client);
	}
	catch (err) {
		error(err);
	}

	setTimeout(() => start(client), activityUpdateFrequency * 1000);
}

/**
 * Sets the activity of the bot.
 *
 * @throws If the activity does not update correctly
 */
function setActivity (client: Client<true>): void {
	const { activities } = client.user.setActivity(activityOptions);
	const activity = activities.at(0);

	// Double check to see if it worked
	// FIXME this currently always returns true, but discord.js doesn't have a better way to check
	if (!activity
		|| activity.name !== activityOptions.name
		|| activity.type !== activityOptions.type
		|| activity.url !== activityOptions.url) {
		throw new Error("User presence did not update correctly.");
	}
}
