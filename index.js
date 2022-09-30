/* Discord-Cleverbot */

console.log('Importing packages');
// .system);	// Won't work yet because colors isn't imported

// Load in all the required packages
const fs = require('node:fs');
const path = require('node:path');
const colors = require('@colors/colors');
const { Client, Partials, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');

const { debugTheme, embedColors } = require('./parameters.js');
const { setEventHandlers } = require('./events');
const { setWhitelistAccount } = require('./whitelist-manager.js');

// Set the console debug colors
colors.setTheme(debugTheme);

// Create a discord client and give it helper functions and values
const client = new Client({
	partials: [
		// Necessary to receive DMs
		Partials.Channel,
	],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
	],
});

// Executes the code for a particular handler without needing to receive the event
client.executeEvent = async function(eventName, ...args) {
	const event = client.events.get(eventName);
	if (!event) throw new Error(`Could not find handler for event '${eventName}'`);

	return await event.execute(client, ...args);
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
	// Format the message as an embed
	const embed = new EmbedBuilder()
		.setColor(embedColors.error)
		.setTitle('Error')
		.setDescription('I encountered an error while trying to respond. Please forward this to my developer.')
		.setFields(
			{ name: 'Message', value: `\`\`${internalError}\`\`` },
		);

	// Send the error message as a reply
	console.log('Sending error message'.system);
	message.reply({ embeds: [embed] }).then(() => {
		console.log('Error message sent successfully'.system);
		console.log();
	}).catch(error => {
		console.error('\t', client.debugFormatError(error));
		console.log('Failed to send error message'.warning);
		console.log();
	});
};

console.log('Imported packages successfully'.system);
console.log();

// Retrieves the command names and files
const retrieveSlashCommands = function() {
	console.log('Retrieving commands'.system);

	// Gather all the command files
	client.commands = new Collection();
	const commandsPath = path.join(__dirname, 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	// Extract the name and executables of the command files
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		client.commands.set(command.data.name, command);
		console.log('\tRetrieved'.system, `/${command.data.name}`);
	}

	console.log('Retrieved commands successfully'.system);
	console.log();
}; retrieveSlashCommands();

// Retrieve the event handler files and give them to the client
setEventHandlers(client);

// Load memory files
console.log('Loading memory files'.system);

// Was login info provided?
if (process.argv[2] === undefined) {
	const error = new Error();
	error.name = 'Missing Console Argument';
	error.message = 'Account directory name not provided';
	error.message += '\n\tPlease follow this usage:';
	error.message += '\n\tnode index.js ' + '[ACCOUNT DIRECTORY NAME]'.underline;
	throw client.debugFormatError(error);
}
const filePath = `./accounts/${process.argv[2]}`;
const configFilePath = `${filePath}/config.json`;
const whitelistFilePath = `${filePath}/whitelist.json`;

// Does the necessary directory exist?
if (!fs.existsSync(filePath)) {
	const error = new Error();
	error.name = 'Missing Account Directory';
	error.message = 'Account directory does not exist';
	error.message += `\n\tPlease create a directory (${filePath}) to contain the account's memory files`;
	throw client.debugFormatError(error);
}

// Do the necessary files exist?
if (!fs.existsSync(configFilePath) || !fs.existsSync(whitelistFilePath)) {
	const error = new Error();
	error.name = 'Missing Memory Files';
	error.message = 'Account directory missing essential memory files';
	error.message += `\n\tPlease create the necessary files (${configFilePath}) (${whitelistFilePath})`;
	throw client.debugFormatError(error);
}

const { token } = require(configFilePath);
setWhitelistAccount(process.argv[2]);

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
		console.log('Retrying connection in'.warning, retryWait, 'seconds...'.warning);
		console.log();
		// Use connect() function again
		setTimeout(connect, retryWait * 1000);
	});
}; connect();