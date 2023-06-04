import type { Client } from "discord.js";

import type { EventHandler } from "../@types/EventHandler.js";
import { logEventError } from "./index.js";
import { start as manageActivity } from "../activity.js";
import { info } from "../logger.js";
import { refresh } from "../refresh.js";

export const ready: EventHandler<"ready"> = {
	name: "ready",
	once: true,
	async execute (client: Client) {
		try {
			await onceReady(client);
		}
		catch (error) {
			logEventError(ready.name, error);
		}
	},
};

/**
 * Called once the client successfully logs in.
 */
async function onceReady (client: Client): Promise<void> {
	info("Client ready");
	info();

	manageActivity(client);
	await refresh(client);
}
