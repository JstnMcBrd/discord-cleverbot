/**
 * Index for the events folder
 *
 * Loads all the event handlers and gives them to the Client.
 * Also contains other useful helper methods.
 */

import type { Client } from "discord.js";

import type { EventHandler } from "../@types/EventHandler";
import * as logger from "../helpers/logger";

// Gather all the event files
const events = new Map<string, EventHandler>;

// Define methods

/**
 * @returns the list of events
 */
export function getEvents() {
	return events;
}

/**
 * Gives the client all of the event handlers.
 */
export function setEventHandlers(client: Client) {
	logger.info("Setting client event handlers");

	getEvents().forEach((event) => {
		if (event.once) {
			client.once(event.name, event.execute);
		}
		else {
			client.on(event.name, event.execute);
		}
		logger.info(`\tSet ${event.once ? "once" : "on"}(${event.name})`);
	});

	logger.info("Set client event handlers successfully");
}

/**
 * Executes the code for a particular handler without needing to receive the event.
 * @param eventName the name of the event handler to execute
 * @param args the arguments to pass to the event handler
 * @returns a promise from the event handler
 */
// export async function executeEvent(eventName: string, ...args: unknown[]): Promise<unknown> {
// 	const event = getEvents().get(eventName);
// 	if (!event) throw new Error(`Could not find handler for event '${eventName}'`);

// 	return await event.execute(...args);
// }

/**
 * Reports an error from an event handler.
 * @param eventName the name of the event throwing the error
 * @param error the error
 */
export function eventError(eventName: string, error: Error) {
	logger.error(`Error in event '${eventName}'`);
	logger.error(error);
}

// Extract the name and executables of the event files
import { error } from "./error";
events.set(error.name, error as EventHandler);
import { interactionCreate } from "./interactionCreate";
events.set(interactionCreate.name, interactionCreate as EventHandler);
import { messageCreate } from "./messageCreate";
events.set(messageCreate.name, messageCreate as EventHandler);
import { ready } from "./ready";
events.set(ready.name, ready as EventHandler);
