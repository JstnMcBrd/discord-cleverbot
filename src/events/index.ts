/**
 * Index for the events folder
 *
 * Loads all the event handlers and gives them to the Client.
 * Also contains other useful helper methods.
 */

import type { Client, ClientEvents } from "discord.js";

import type { EventHandler } from "../@types/EventHandler";
import * as logger from "../logger";
import { error } from "./error";
import { interactionCreate } from "./interactionCreate";
import { messageCreate } from "./messageCreate";
import { ready } from "./ready";

const events = new Map<string, EventHandler>;

addEventHandler(error as EventHandler);
addEventHandler(interactionCreate as EventHandler);
addEventHandler(messageCreate as EventHandler);
addEventHandler(ready as EventHandler);

function addEventHandler(event: EventHandler<keyof ClientEvents>): void {
	const name = event.name;

	if (events.has(name)) {
		throw new TypeError(`Failed to add event handler '${name}' when an event with that name was already added`);
	}

	events.set(name, event);
}

export function getEventHandlers(): ReadonlyMap<string, EventHandler> {
	return events;
}

export function registerEventHandlers(client: Client) {
	logger.info("Setting client event handlers...");

	getEventHandlers().forEach((event) => {
		if (event.once) {
			client.once(event.name, event.execute);
		}
		else {
			client.on(event.name, event.execute);
		}
		logger.debug(`\tSet ${event.once ? "once" : "on"}(${event.name})`);
	});

	logger.info();
}

export function logEventError(eventName: string, err: Error|unknown) {
	logger.error(`Error in event '${eventName}'`);
	logger.error(err);
}
