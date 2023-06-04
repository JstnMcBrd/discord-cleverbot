import { EventHandler } from "../@types/EventHandler.js";

import { error as errorLog, warn } from "../logger.js";

/**
 * Called whenever the discord.js client encounters an error.
 */
export const error = new EventHandler("error")
	.setOnce(false)
	.setExecution(function (err: Error): void {
		warn();
		warn("Discord Client encountered error");
		errorLog(err);
		warn();
	});
