import type { EventHandler } from "../@types/EventHandler.js";

import * as logger from "../logger.js";
import { logEventError } from "./index.js";

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
	logger.info();
	logger.warn("Discord Client encountered error");
	logger.error(err);
	logger.info();
};
