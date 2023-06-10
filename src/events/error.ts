import { EventHandler } from "./EventHandler.js";

/** Called whenever the discord.js client encounters an error. */
export const error = new EventHandler("error")
	.setOnce(false)
	.setExecution(function (err: Error): void {
		//
	});
