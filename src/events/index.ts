/**
 * Index for the events folder
 *
 * Loads all the event handlers and gives them to the Client.
 * Also contains other useful helper methods.
 */

import type { Client } from "discord.js";

import { error } from "./error.js";
import type { EventHandler } from "./EventHandler.js";
import { interactionCreate } from "./interactionCreate.js";
import { messageCreate } from "./messageCreate.js";
import { ready } from "./ready.js";
import { debug, info } from "../logger.js";

const events = new Map<string, EventHandler>;

addEventHandler(error as EventHandler);
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

/**
 * // TODO
 */
export function getEventHandlers (): ReadonlyMap<string, EventHandler> {
	return events;
}

/**
 * // TODO
 */
export function registerEventHandlers (client: Client) {
	info("Setting client event handlers...");

	getEventHandlers().forEach(event => {
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
		debug(`\tSet ${event.once ? "once" : "on"}(${event.name})`);
	});

	info();
}
