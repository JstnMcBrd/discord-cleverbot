import type { EventHandler } from "../@types/EventHandler";

import * as logger from "../helpers/logger";
import { eventError } from "./";

export const error: EventHandler<"error"> = {
	name: "error",
	once: false,
	execute(err: Error) {
		try {
			onError(err);
		}
		catch (err2) {
			eventError(this.name, err2 as Error);
		}
	},
};

/**
 * Called whenever the discord.js client encounters an error.
 */
const onError = function(err: Error) {
	logger.info();
	logger.warn("Discord Client encountered error");
	logger.error(err);
	logger.info();
};
