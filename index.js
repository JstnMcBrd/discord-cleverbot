/* Discord-Cleverbot */

// When this code was last changed
// year, month (0-11), day of month, hour (0-23), minutes
const lastUpdated = new Date(2022, 8, 25, 3, 0);
// How fast the bot sends messages (characters per second)
const typingSpeed = 6;
// The colors that the console output should use
const debugTheme = {
	system: ['green'],
	warning: ['yellow'],
	error: ['red'],
	info: ['gray'],
};

// Connects the client with the discord API
const connect = function() {
	// How long to wait before trying again (seconds)
	const retryWait = 10;

	console.log('Logging in'.system);
	client.login(token).then(() => {
		console.log('Logged in successfully'.system);
		console.log();
	}).catch(error => {
		console.error('\t' + debugFormatError(error));
		console.log('Retrying connection in '.warning + retryWait + ' seconds...'.warning);
		console.log();
		// Use connect() function again
		setTimeout(connect, retryWait * 1000);
	});
};

// Called once the client successfully logs in
const onceReady = async function() {
	console.log('Client ready'.system);
	console.log();

	setUserActivity();
	await retrieveSlashCommands();
	resumeConversations();
};

// Sets the acitivity of the bot to be 'Listening to /help'
const setUserActivity = function() {
	// How long to wait before trying again (seconds)
	const repeatWait = 5 * 60;

	// Wait until Discord supports custom statuses for bots
	/*
	activityOptions = {
		name: 'Use /help',
		details: 'Use /help',
		emoji: {
			name: 'robot'
		},
		type: Discord.ActivityType.Custom,
		url: 'https://www.cleverbot.com/'
	}
	*/
	// Use this in the meantime
	const activityOptions = {
		name: '/help',
		type: Discord.ActivityType.Listening,
		url: 'https://www.cleverbot.com/',
	};

	// Set the user's activity
	console.log('Setting user activity'.system);
	const presence = client.user.setActivity(activityOptions);

	// Double check to see if it worked
	// This currently always returns true, but discord.js doesn't have a better way to check
	const activity = presence.activities[0];
	let correct = false;
	if (activity !== undefined) {
		correct = activity.name === activityOptions.name &&
			activity.type === activityOptions.type &&
			activity.url === activityOptions.url;
	}
	if (correct)	console.log('Set user activity successfully'.system);
	else 			console.error('Failed to set user activity'.warning);

	// Set user activity at regular intervals
	setTimeout(setUserActivity, repeatWait * 1000);
	console.log('Setting again in '.system + repeatWait + ' seconds'.system);
	console.log();
};

// Retrieves the command names and files
const retrieveSlashCommands = async function() {
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
};

// Searchs for unread messages in whitelisted channels that were sent when the bot was offline, and responds to them
const resumeConversations = async function() {
	// How long to wait before trying again (seconds)
	const repeatWait = 30 * 60;
	const messageSearchDepth = 10;

	console.log('Searching for missed messages'.system);
	const toRespondTo = [];
	try {
		const whitelist = getWhitelist();
		for (let c = 0; c < whitelist.length; c++) {
			const channelID = whitelist[c];

			// Fetch the channel
			const channel = await client.channels.fetch(channelID).catch(error => {
				// If the channel doesn't exist, remove it from the whitelist
				if (error.message === 'Unknown Channel' || error.message === 'Missing Access') {
					console.error('\tInvalid channel ID found in whitelist ('.error + channelID + ')'.error);
					removeFromWhitelist(channelID);
					console.log('\tInvalid channel ID removed from whitelist ('.warning + channelID + ')'.warning);
				}
				else {
					throw error;
				}
			});
			// End this iteration if the 'Unknown Channel' error was caught above
			if (channel === undefined) continue;

			// Request the most recent messages of the channel
			let messages = await channel.messages.fetch({ limit: messageSearchDepth });

			// Convert map to array
			messages = messages.first(messages.size);

			// Search for messages that haven't been replied to
			for (let m = 0; m < messages.length; m++) {
				const message = messages[m];
				if (isEmptyMessage(message) || isMarkedAsIgnore(message)) continue;
				if (!isFromUser(message)) toRespondTo.push(message);
				break;
			}
		}
	}
	catch (error) {
		// Log the error
		console.error('\t' + debugFormatError(error));
		console.log('Failed to search for missed messages'.warning);
	}
	if (toRespondTo.length !== 0) {
		console.log('\tFound '.system + toRespondTo.length + ' missed messages'.system);
	}
	console.log('Searched for missed messages successfully'.system);

	// Check for missed messages at regular intervals
	setTimeout(resumeConversations, repeatWait * 1000);
	console.log('Searching again in '.system + repeatWait + ' seconds'.system);

	// Respond to missed messages
	if (toRespondTo.length !== 0) {
		console.log('Forwarding messages to message handler'.system);
		console.log();
		toRespondTo.forEach(message => onMessage(message));
	}
	else {
		console.log();
	}
};

// Called whenever the discord.js client encounters an error
const onError = function(error) {
	console.log();
	console.error('Discord Client encountered error'.warning);
	console.error('\t', debugFormatError(error));
	console.log();
};

// Called whenever the discord.js client receives an interaction (usually means a slash command)
const onInteraction = async function(interaction) {
	// Ignore any interactions that are not commands
	if (!interaction.isChatInputCommand()) return;
	console.log('Received command interaction'.system);
	console.log('\t' + debugInteraction(interaction));

	// Ignore any commands that are not recognized
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	console.log('Command recognized'.system);

	// Give additional information to the interaction to be passed to the command script
	interaction.extraInfo = {
		lastUpdated: lastUpdated,
		addToWhitelist: addToWhitelist,
		removeFromWhitelist: removeFromWhitelist,
	};

	// Execute the command script
	console.log('Executing command'.system);
	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error('\t' + debugFormatError(error));
		console.error('Failed to execute command'.warning);
		console.log();
		sendErrorMessage(interaction, error);
		return;
	}
	console.log('Command executed successfully'.system);
	console.log();
};

// Called whenever the discord.js client observes a new message
const onMessage = async function(message) {
	// Ignore messages if they are...
	// ... from the user
	if (isFromUser(message)) return;
	// ... empty (images, embeds, interactions)
	if (isEmptyMessage(message)) return;
	// ... marked as ignore
	if (isMarkedAsIgnore(message)) return;
	// ... in a channel already responding to
	if (isThinking(message.channel)) return;
	// ... not whitelisted or forced reply
	if (!isWhitelisted(message.channel) && !isAMention(message)) return;

	console.log('Received new message'.system);
	console.log(indent(debugMessage(message), 1));

	// Clean up message, also used in generateContext()
	console.log('Cleaning up message'.system);
	let input = message.cleanContent;
	if (isAMention(message)) {
		input = replaceMentions(input);
	}
	input = replaceUnknownEmojis(input);
	input = input.trim();
	console.log(indent('Content: '.info + input, 1));

	// Generate or update conversation context
	if (!hasContext(message.channel)) {
		console.log('Generating new channel context'.system);
		await generateContext(message.channel);
	}
	else {
		addToContext(message.channel, input);
	}

	// Prevent bot from responding to anything else while it thinks
	startThinking(message.channel);

	// Actually generate response
	console.log('Generating response'.system);
	cleverbot(input, getContext(message.channel)).then(response => {
		// Sometimes cleverbot goofs and returns an empty response
		if (response === '') {
			const error = new Error();
			error.name = 'Invalid Cleverbot Response';
			error.message = 'Response is an empty string';
			throw error;
		}

		console.log('Generated response successfully'.system);
		console.log('\tResponse: '.info + response);

		// Determine how long to show the typing indicator before sending the message (seconds)
		const timeTypeSec = response.length / typingSpeed;
		message.channel.sendTyping();
		// Will automatically stop typing when message sends

		// Send the message once the typing time is over
		console.log('Sending message'.system);
		setTimeout(
			function() {
				// Respond normally if no extra messages have been sent in the meantime
				if (message.channel.lastMessageId === message.id) {
					message.channel.send(response).then(() => {
						console.log('Sent message successfully'.system);
						console.log();
					}).catch(error => {
						console.error('\t' + debugFormatError(error));
						console.error('Failed to send message'.warning);
					});
				}
				// Use reply to respond directly if extra messages are in the way
				else {
					message.reply(response).then(() => {
						console.log('Sent reply successfully'.system);
						console.log();
					}).catch(error => {
						console.error('\t' + debugFormatError(error));
						console.error('Failed to send reply'.warning);
					});
				}

				// Update conversation context
				addToContext(message.channel, response);

				// Allow bot to think about new messages now
				stopThinking(message.channel);
			},
			timeTypeSec * 1000,
		);
	}).catch(error => {
		// Undo adding to context
		removeLastMessageFromContext(message.channel);

		// Stop thinking so bot can respond in future
		stopThinking(message.channel);

		// Log the error
		console.error('\t' + debugFormatError(error));
		console.error('Failed to generate response'.warning);

		// If error is timeout, then try again
		if (error.message === 'Response timeout of 10000ms exceeded' ||
		error === 'Failed to get a response after 15 tries' ||
		error.message === 'Response is an empty string') {
			console.log('Trying again'.system);
			console.log();
			onMessage(message);
		}
		// If unknown error, then respond to message with error message
		else {
			console.log('Replying with error message'.system);
			console.log();
			sendErrorMessage(message, error);
		}
	});
};

// Replaces @ mentions of the user with 'Cleverbot' to avoid confusing the Cleverbot AI
const replaceMentions = function(content) {
	return content.replaceAll('@' + client.user.username, 'Cleverbot');
};

// Replaces unknown discord emojis with the name of the emoji as *emphasized* text to avoid confusing the Cleverbot AI
const replaceUnknownEmojis = function(content) {
	// Start with custom emojis
	content = content.replaceAll(/<:[\w\W][^:\s]+:\d+>/g, match => {
		match = match.replace('<:', '');
		match = match.replace(/:\d+>/g, '');
		match = match.replace('_', ' ');
		return '*' + match + '*';
	});
	// Now replace any unknown emojis that aren't custom
	content = content.replaceAll(':', '*').replaceAll('_', ' ');
	return content;
};

// Responds to a message with an error message
const sendErrorMessage = function(message, internalError) {
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
		console.error('\t' + debugFormatError(error));
		console.log('Failed to send error message'.warning);
		console.log();
	});
};

// Recognizes when a message is prepended with '> ', which tells the bot not to respond
const isMarkedAsIgnore = function(message) {
	return message.cleanContent.substring(0, 2) === '> ';
};

// Recognizes when a message is from the current user
const isFromUser = function(message) {
	return message.author.id === client.user.id;
};

// Recognizes when a message is empty (mostly likely an image)
const isEmptyMessage = function(message) {
	return message.cleanContent === '';
};

// Recognizes when a message @ mentions the current user
const isAMention = function(message) {
	return message.mentions.has(client.user);
};

// Reads the whitelist from memory
const getWhitelist = function() {
	return JSON.parse(fs.readFileSync(whitelistFilePath));
};

// Writes the whitelist to memory
const setWhitelist = function(whitelist) {
	fs.writeFileSync(whitelistFilePath, JSON.stringify(whitelist));
};

// Adds a channel to the whitelist and updates memory
const addToWhitelist = function(channel) {
	// Will work with a channel object or just a channel ID
	let channelID = channel.id;
	if (channelID === undefined) channelID = channel;

	// If the channel is not already in the whitelist, add it
	if (!isWhitelisted(channelID)) {
		const whitelist = getWhitelist();
		whitelist.push(channelID);
		setWhitelist(whitelist);
		return true;
	}
	return false;
};

// Removes a channel from the whitelist and updates memory
const removeFromWhitelist = function(channel) {
	// Will work with a channel object or just a channel ID
	let channelID = channel.id;
	if (channelID === undefined) channelID = channel;

	// If the channel is in the whitelist, remove it
	if (isWhitelisted(channelID)) {
		const whitelist = getWhitelist();
		whitelist.splice(whitelist.indexOf(channelID), 1);
		setWhitelist(whitelist);
		return true;
	}
	return false;
};

// Checks if a channel is in the whitelist
const isWhitelisted = function(channel) {
	// Will work with a channel object or just a channel ID
	let channelID = channel.id;
	if (channelID === undefined) channelID = channel;

	return getWhitelist().indexOf(channelID) !== -1;
};

// Keeps track of whether the bot is already generating a response for each channel
// Don't access directly - use the methods below
const thinking = {
	// channelID: true/false,
};

// Checks to see if the bot is currently generating a response in a channel
const isThinking = function(channel) {
	return thinking[channel.id];
};

// Records that the bot is currently generating a response in the channel
const startThinking = function(channel) {
	thinking[channel.id] = true;
};

// Records that the bot has finished generating a response in the channel
const stopThinking = function(channel) {
	thinking[channel.id] = false;
};

// Keeps track of the past conversation for each channel
// Don't access directly - use the methods below
const context = {
	// channelID: ['past','messages']
};
// Limits the length of each channel's context so memory isn't overburdened
const maxContextLength = 50;

// Returns the past messages of the channel
const getContext = function(channel) {
	return context[channel.id];
};

// Checks whether the past messages of the channel have been recorded yet
const hasContext = function(channel) {
	return context[channel.id] !== undefined;
};

// Fetches and records the past messages of the channel
const generateContext = async function(channel) {
	context[channel.id] = [];
	let repliedTo = undefined;
	let lastMessageFromUser = false;

	// Fetch past messages
	const messages = await channel.messages.fetch({ limit: maxContextLength });
	messages.each(message => {
		// Skip ignored messages and empty messages
		if (isMarkedAsIgnore(message) || message.cleanContent === '') return;
		// Skip messages that bot skipped in the past
		if (!isFromUser(message) && repliedTo !== undefined && message.id !== repliedTo) return;

		// Clean up message, also used in onMessage()
		let input = message.cleanContent;
		if (isAMention(message)) input = replaceMentions(input);
		input = replaceUnknownEmojis(input);

		// If there are two messages from other users in a row, make them the same message so cleverbot doesn't get confused
		if (!isFromUser(message) && !lastMessageFromUser && context[channel.id][0] !== undefined) {
			context[channel.id][0] = input + '\n' + context[channel.id][0];
		}
		else {
			context[channel.id].unshift(input);
		}

		// If the message is from self, and it replies to another message,
		// record what that message is so we can skip all the ignored messages in between (see above)
		if (message.id === repliedTo) {
			// Reset for the future
			repliedTo = undefined;
		}
		if (isFromUser(message) && message.reference !== null) {
			if (message.reference.messageId !== undefined) {
				repliedTo = message.reference.messageId;
			}
		}

		lastMessageFromUser = isFromUser(message);
	});

	return context[channel.id];
};

// Adds a message to the recorded past messages of a channel
const addToContext = function(channel, str) {
	context[channel.id].push(str);
	// Make sure context doesn't go over the max length
	if (context[channel.id].length > maxContextLength) {
		context[channel.id].shift();
	}
};

// Removes the most recent message from the recorded past messages of a channel
const removeLastMessageFromContext = function(channel) {
	context[channel.id].pop();
};

// Indents strings that have more than one line
const indent = function(str, numTabs) {
	let tabs = '';
	while (numTabs > 0) {
		tabs += '\t';
		numTabs--;
	}
	return (tabs + str).replaceAll('\n', '\n' + tabs);
};

// Takes either a string or an Error and gives them the error color for the console
const debugFormatError = function(error) {
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

// Logs important information about a message to the console
const debugMessage = function(message) {
	let str = 'MESSAGE'.info;
	str += '\nContent: '.info + message.cleanContent;
	str += '\nAuthor:  '.info + message.author.tag + ' ('.info + message.author.id + ')'.info;
	str += '\nChannel: '.info + message.channel.name + ' ('.info + message.channel.id + ')'.info;
	// Compensate for DMs
	if (message.guild !== null) {
		str += '\nGuild:   '.info + message.guild.name + ' ('.info + message.guild.id + ')'.info;
	}
	return str;
};

// Logs important information about an interaction to the console
const debugInteraction = function(interaction) {
	let str = 'INTERACTION'.info;
	if (interaction.isChatInputCommand()) {
		str += '\nCommand: '.info + interaction.commandName;
	}
	str += '\nUser:    '.info + interaction.user.tag + ' ('.info + interaction.user.id + ')'.info;
	str += '\nChannel: '.info + interaction.channel.name + ' ('.info + interaction.channel.id + ')'.info;
	// Compensate for DMs
	if (interaction.guild !== null) {
		str += '\nGuild:   '.info + interaction.guild.name + ' ('.info + interaction.guild.id + ')'.info;
	}
	return str;
};


// Action!

console.log('Importing packages');
// .system);	// Won't work yet because colors isn't imported

// Load in all the required packages
const fs = require('node:fs');
const path = require('node:path');
const colors = require('@colors/colors');
const Discord = require('discord.js');
const cleverbot = require('cleverbot-free');

// Set the console debug colors
colors.setTheme(debugTheme);

// Create a discord client and give it the callback methods
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
client.on('error', error => onError(error));
client.once('ready', onceReady);
client.on('interactionCreate', interaction => onInteraction(interaction));
client.on('messageCreate', message => onMessage(message));

console.log('Imported packages successfully'.system);
console.log();

// Load memory files
console.log('Loading memory files'.system);

// Was login info provided?
if (process.argv[2] === undefined) {
	const error = new Error();
	error.name = 'Missing Console Argument';
	error.message = 'Account directory name not provided';
	error.message += '\n\tPlease follow this usage:';
	error.message += '\n\tnode ' + process.argv[1] + ' ' + '[ACCOUNT DIRECTORY NAME]'.underline;
	throw debugFormatError(error);
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
	throw debugFormatError(error);
}

// Do the necessary files exist?
if (!fs.existsSync(configFilePath) || !fs.existsSync(whitelistFilePath)) {
	const error = new Error();
	error.name = 'Missing Memory Files';
	error.message = 'Account directory missing essential memory files';
	error.message += '\n\tPlease create the necessary files (' + configFilePath + ') (' + whitelistFilePath + ')';
	throw debugFormatError(error);
}
const { token } = require(configFilePath);

console.log('Loaded memory files successfully'.system);
console.log();

// Let's begin
connect();