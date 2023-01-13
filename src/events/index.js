/**
 * Index for the events folder
 *
 * Loads all the event handlers and gives them to the Client.
 * Also contains other useful helper methods.
 */

// Load in all the required packages
const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');

const logger = require('../helpers/logger');

// Gather all the event files
const events = new Collection();
const eventFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file != 'index.js');

// Define methods

/**
 * Returns the list of events
 * @returns the list of events
 * @public
 */
const getEvents = function() {
	return events;
};

/**
 * Gives the client all of the event handlers
 * @param {Client} client the client whose event handlers to set
 * @public
 */
const setEventHandlers = function(client) {
	logger.info('Setting client event handlers');

	getEvents().each((event) => {
		if (event.once) {
			client.once(event.name, event.execute);
		}
		else {
			client.on(event.name, event.execute);
		}
		logger.info(`\tSet ${event.once ? 'once' : 'on'}(${event.name})`);
	});

	logger.info('Set client event handlers successfully');
};

/**
 * Executes the code for a particular handler without needing to receive the event
 * @param {string} eventName the name of the event handler to execute
 * @param  {...any} args the arguments to pass to the event handler
 * @returns a promise from the event handler
 * @public
 */
const executeEvent = async function(eventName, ...args) {
	const event = getEvents().get(eventName);
	if (!event) throw new Error(`Could not find handler for event '${eventName}'`);

	return await event.execute(...args);
};

/**
 * Reports an error from an event handler
 * @param {string} eventName the name of the event throwing the error
 * @param {Error} error the error
 * @public
 */
const eventError = function(eventName, error) {
	logger.error(`Error in event '${eventName}'`);
	logger.error(error);
};

// Export public methods
module.exports = {
	getEvents,
	setEventHandlers,
	executeEvent,
	eventError,
};

// Extract the name and executables of the event files
// All of them have dependencies on this index, so we have to wait until after module.exports to import them
for (const file of eventFiles) {
	const filePath = path.join(__dirname, file);
	const event = require(filePath);
	events.set(event.name, event);
}