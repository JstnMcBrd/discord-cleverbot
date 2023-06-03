import type { EventHandler } from "../@types/EventHandler.js";

import { logEventError } from "./index.js";
import { error as errorLog, warn } from "../logger.js";


export const error: EventHandler<"error"> = {
	name: "error",
	once: false,
	execute (err: Error) {
		try {
			onError(err);
		}
		catch (err2) {
			logEventError(error.name, err2);
		}
	},
};

/**
 * Called whenever the discord.js client encounters an error.
 */
const onError = function (err: Error) {
	warn();
	warn("Discord Client encountered error");
	errorLog(err);
	warn();
};
