import { Colors } from "discord.js";

/**
 * When this code was last changed.
 */
export const lastUpdated = new Date(2022, 8, 30, 3, 30);
// Year, month (0-11), day of month, hour (0-23), minutes

/**
 * How fast the bot sends messages (in characters per second).
 */
export const typingSpeed = 6;

/**
 * The colors to be used for embeds.
 */
export const embedColors = {
	error: Colors.Red,
	info: Colors.Grey,
	whitelist: Colors.Green,
	unwhitelist: Colors.Yellow,
};
