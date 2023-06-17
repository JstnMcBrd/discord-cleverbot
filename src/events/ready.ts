import { EventHandler } from "./EventHandler.js";
import { start as startActivity } from "../activity.js";
import { refresh } from "../refresh.js";
import { debug } from "../logger.js";
import { syncCommands } from "../commands/index.js";

/** Called once the client successfully logs in. */
export const ready = new EventHandler("ready")
	.setOnce(true)
	.setExecution(async client => {
		debug(`\tUser: ${client.user.username} (${client.user.id})`);
		await syncCommands(client);
		startActivity(client);
		await refresh(client);
	});
