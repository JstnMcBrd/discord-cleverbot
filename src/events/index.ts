/**
 * Index for the events folder
 *
 * Loads all the event handlers and gives them to the Client.
 * Also contains other useful helper methods.
 */

import type { Client } from "discord.js";

import type { EventHandler } from "../@types/EventHandler.js";
import { error as errorH } from "./error.js";
import { interactionCreate } from "./interactionCreate.js";
import { messageCreate } from "./messageCreate.js";
import { ready } from "./ready.js";
import { debug, error, info } from "../logger.js";

const events = new Map<string, EventHandler>;

addEventHandler(errorH as EventHandler);
addEventHandler(interactionCreate as EventHandler);
addEventHandler(messageCreate as EventHandler);
addEventHandler(ready as EventHandler);

function addEventHandler (event: EventHandler): void {
	const name = event.name;

	if (events.has(name)) {
		throw new TypeError(`Failed to add event handler '${name}' when an event with that name was already added`);
	}
	events.set(name, event);
}

export function getEventHandlers (): ReadonlyMap<string, EventHandler> {
	return events;
}

export function registerEventHandlers (client: Client) {
	info("Setting client event handlers...");

	getEventHandlers().forEach((event) => {
		if (event.once) {
			client.once(event.name, event.execute);
		}
		else {
			client.on(event.name, event.execute);
		}
		debug(`\tSet ${event.once ? "once" : "on"}(${event.name})`);
	});

	info();
}

export function logEventError (eventName: string, err: Error|unknown) {
	error(`Error in event '${eventName}'`);
	error(err);
}
