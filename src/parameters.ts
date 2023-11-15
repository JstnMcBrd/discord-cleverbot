import { Colors } from "discord.js";

import { getVersion } from "./utils/getVersion.js";

/** The version number of this project. */
export const version = getVersion();

/** When this code was last changed. */
export const lastUpdated = new Date(2023, 10, 14, 19, 0);
// Year, month (0-11), day of month, hour (0-23), minutes

/** How fast the bot sends messages (in characters per second). */
export const typingSpeed = 8;

/** The colors to be used for embeds. */
export const embedColors = {
	error: Colors.Red,
	info: Colors.Grey,
	whitelist: Colors.Green,
	unwhitelist: Colors.Yellow,
};
