import { Colors } from 'discord.js';

import { getVersion } from './utils/getVersion.js';

/** The version number of this project. */
export const version = getVersion();

/** The URL of this bot's source code on GitHub. */
export const githubURL = new URL('https://github.com/JstnMcBrd/discord-cleverbot');

/** When this code was last changed. */
export const lastUpdated = new Date(2024, 3, 24, 1, 0);
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
