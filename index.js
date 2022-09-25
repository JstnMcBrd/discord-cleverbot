/* Discord-Cleverbot */

// When this code was last changed
// year, month (0-11), day of month, hour (0-23), minutes
const lastUpdated = new Date(2022, 8, 25, 7, 30);
// How fast the bot sends messages (characters per second)
const typingSpeed = 6;
// The colors that the console output should use
const debugTheme = {
	system: ['green'],
	warning: ['yellow'],
	error: ['red'],
	info: ['gray'],
};

// Action!

console.log('Importing packages');
// .system);	// Won't work yet because colors isn't imported

// Load in all the required packages
const fs = require('node:fs');
const path = require('node:path');
const colors = require('@colors/colors');
const Discord = require('discord.js');

// Set the console debug colors
colors.setTheme(debugTheme);

// Create a discord client and give it helper functions and values
const client = new Discord.Client({
	partials: [
		// Necessary to receive DMs
		Discord.Partials.Channel,
	],
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildMessageTyping,
		Discord.GatewayIntentBits.DirectMessages,
		Discord.GatewayIntentBits.DirectMessageTyping,
		Discord.GatewayIntentBits.MessageContent,
	],
});

client.lastUpdated = lastUpdated;
client.typingSpeed = typingSpeed;

// Executes the code for a particular handler without needing to receive the event
client.executeEvent = async function(eventName, ...args) {
	const event = client.events.get(eventName);
	if (!event) throw new Error('Could not find handler for event \'' + eventName + '\'');

	return await event.execute(client, ...args);
};

// Reports an error from an event handler
client.eventError = function(eventName, error) {
	error = client.debugFormatError(error);
	console.error('Error in event \'%s\'', eventName);
	console.error(error);
};

// Takes either a string or an Error and gives them the error color for the console
client.debugFormatError = function(error) {
	// If the error is just a string, color it with the error color
	if (typeof (error) === 'string') {
		return error.error;
	}

	// If the error is an error object, color the title with the error color
	const e = new Error();
	if (error.name !== undefined) {
		e.name = error.name.error;
	}
	e.message = error.message;
	return e;
};

// Responds to a message with an error message
client.sendErrorMessage = function(message, internalError) {
	const hexRed = 0xFF0000;

	// Format the message as an embed
	const embed = {
		title: 'Error',
		description: 'I encountered an error while trying to respond. Please forward this to my developer.',
		// Red
		color: hexRed,
		fields: [
			{
				name: 'Message',
				value: '``' + internalError + '``',
			},
		],
	};

	// Send the error message as a reply
	console.log('Sending error message'.system);
	message.reply({ embeds: [embed] }).then(() => {
		console.log('Error message sent successfully'.system);
		console.log();
	}).catch(error => {
		console.error('\t' + client.debugFormatError(error));
		console.log('Failed to send error message'.warning);
		console.log();
	});
};

client.messages = {};

// Recognizes when a message is prepended with '> ', which tells the bot not to respond
client.messages.isMarkedAsIgnore = function(message) {
	return message.cleanContent.substring(0, 2) === '> ';
};

// Recognizes when a message is from the current user
client.messages.isFromUser = function(message) {
	return message.author.id === client.user.id;
};

// Recognizes when a message is empty (mostly likely an image)
client.messages.isEmpty = function(message) {
	return message.cleanContent === '';
};

// Recognizes when a message @ mentions the current user
client.messages.isAMention = function(message) {
	return message.mentions.has(client.user);
};

client.whitelist = {};

// Reads the whitelist from memory
client.whitelist.get = function() {
	return JSON.parse(fs.readFileSync(whitelistFilePath));
};

// Writes the whitelist to memory
client.whitelist.set = function(whitelist) {
	fs.writeFileSync(whitelistFilePath, JSON.stringify(whitelist));
};

// Adds a channel to the whitelist and updates memory
client.whitelist.addChannel = function(channel) {
	// Will work with a channel object or just a channel ID
	let channelID = channel.id;
	if (channelID === undefined) channelID = channel;

	// If the channel is not already in the whitelist, add it
	if (!client.whitelist.has(channelID)) {
		const whitelist = client.whitelist.get();
		whitelist.push(channelID);
		client.whitelist.set(whitelist);
		return true;
	}
	return false;
};

// Removes a channel from the whitelist and updates memory
client.whitelist.removeChannel = function(channel) {
	// Will work with a channel object or just a channel ID
	let channelID = channel.id;
	if (channelID === undefined) channelID = channel;

	// If the channel is in the whitelist, remove it
	if (client.whitelist.has(channelID)) {
		const whitelist = client.whitelist.get();
		whitelist.splice(whitelist.indexOf(channelID), 1);
		client.whitelist.set(whitelist);
		return true;
	}
	return false;
};

// Checks if a channel is in the whitelist
client.whitelist.has = function(channel) {
	// Will work with a channel object or just a channel ID
	let channelID = channel.id;
	if (channelID === undefined) channelID = channel;

	return client.whitelist.get().indexOf(channelID) !== -1;
};

console.log('Imported packages successfully'.system);
console.log();

// Retrieves the command names and files
const retrieveSlashCommands = function() {
	console.log('Retrieving commands'.system);

	// Gather all the command files
	client.commands = new Discord.Collection();
	const commandsPath = path.join(__dirname, 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	// Extract the name and executables of the command files
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		client.commands.set(command.data.name, command);
		console.log('\tRetrieved /' + command.data.name);
	}

	console.log('Retrieved commands successfully'.system);
	console.log();
}; retrieveSlashCommands();

// Retrieves the event names and files
const retrieveEvents = function() {
	console.log('Retrieving events'.system);

	// Gather all the event files
	client.events = new Discord.Collection();
	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	// Extract the name and executables of the event files
	// and give them to the client's event handlers
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		client.events.set(event.name, event);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(client, ...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(client, ...args));
		}
		console.log('\tRetrieved \'%s\'', event.name);
	}

	console.log('Retrieved events successfully'.system);
	console.log();
}; retrieveEvents();

// Load memory files
console.log('Loading memory files'.system);

// Was login info provided?
if (process.argv[2] === undefined) {
	const error = new Error();
	error.name = 'Missing Console Argument';
	error.message = 'Account directory name not provided';
	error.message += '\n\tPlease follow this usage:';
	error.message += '\n\tnode ' + process.argv[1] + ' ' + '[ACCOUNT DIRECTORY NAME]'.underline;
	throw client.debugFormatError(error);
}
const filePath = './accounts/' + process.argv[2] + '/';
const configFilePath = filePath + 'config.json';
const whitelistFilePath = filePath + 'whitelist.json';

// Does the necessary directory exist?
if (!fs.existsSync(filePath)) {
	const error = new Error();
	error.name = 'Missing Account Directory';
	error.message = 'Account directory does not exist';
	error.message += '\n\tPlease create a directory (' + filePath + ') to contain the account\'s memory files';
	throw client.debugFormatError(error);
}

// Do the necessary files exist?
if (!fs.existsSync(configFilePath) || !fs.existsSync(whitelistFilePath)) {
	const error = new Error();
	error.name = 'Missing Memory Files';
	error.message = 'Account directory missing essential memory files';
	error.message += '\n\tPlease create the necessary files (' + configFilePath + ') (' + whitelistFilePath + ')';
	throw client.debugFormatError(error);
}
const { token } = require(configFilePath);

console.log('Loaded memory files successfully'.system);
console.log();

// Let's begin
// Connects the client with the discord API
const connect = function() {
	// How long to wait before trying again (seconds)
	const retryWait = 10;

	console.log('Logging in'.system);
	client.login(token).then(() => {
		console.log('Logged in successfully'.system);
		console.log();
	}).catch(error => {
		console.error('\t' + client.debugFormatError(error));
		console.log('Retrying connection in '.warning + retryWait + ' seconds...'.warning);
		console.log();
		// Use connect() function again
		setTimeout(connect, retryWait * 1000);
	});
}; connect();