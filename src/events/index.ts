import type { Client } from 'discord.js';

import { error } from './error.js';
import type { EventHandler } from './EventHandler.js';
import { interactionCreate } from './interactionCreate.js';
import { messageCreate } from './messageCreate.js';
import { ready } from './ready.js';

/** The list of all event handlers. */
const eventHandlers = new Map<string, EventHandler>();

addEventHandler(error);
addEventHandler(interactionCreate);
addEventHandler(messageCreate);
addEventHandler(ready);

/**
 * Add the given event handler to the list of event handlers.
 *
 * @param event The event to add to the list
 * @throws If there is already a handler for the same event in the list
 */
function addEventHandler(event: EventHandler): void {
	const name = event.name;

	if (eventHandlers.has(name)) {
		throw new Error(`Failed to add event handler '${name}' because an event with that name already exists.`);
	}
	eventHandlers.set(name, event);
}

/**
 * @returns A read-only map of the event handlers
 */
export function getEventHandlers(): ReadonlyMap<string, EventHandler> {
	return eventHandlers;
}

/**
 * Registers all the event handlers with the client.
 *
 * @param client The client to register with
 */
export function registerEventHandlers(client: Client): void {
	getEventHandlers().forEach((event) => {
		if (event.once) {
			client.once(event.name, (...args) => void event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => void event.execute(...args));
		}
	});
}
