import { EventHandler } from "./EventHandler.js";
import { error as errorLog } from "../logger.js";

/** Called whenever the discord.js client encounters an error. */
export const error = new EventHandler("error")
	.setOnce(false)
	.setExecution(function (err: Error): void {
		errorLog("Client encountered an error:");
		errorLog(err);
	});
