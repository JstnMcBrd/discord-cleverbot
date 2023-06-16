import type { Client } from "discord.js";

import { EventHandler } from "./EventHandler.js";
import { start as manageActivity } from "../activity.js";
import { refresh } from "../refresh.js";
import { debug } from "../logger.js";

/** Called once the client successfully logs in. */
export const ready = new EventHandler("ready")
	.setOnce(true)
	.setExecution(async function (client: Client<true>): Promise<void> {
		debug(`\tUser: ${client.user.username} (${client.user.id})`);
		manageActivity(client);
		await refresh(client);
	});
