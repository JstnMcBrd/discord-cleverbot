import type { Client } from "discord.js";

import { EventHandler } from "./EventHandler.js";
import { start as manageActivity } from "../activity.js";
import { info } from "../logger.js";
import { refresh } from "../refresh.js";

/** Called once the client successfully logs in. */
export const ready = new EventHandler("ready")
	.setOnce(true)
	.setExecution(async function (client: Client<true>): Promise<void> {
		info("Client ready");
		info();

		manageActivity(client);
		await refresh(client);
	});
