module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
		try {
			await onMessage(message);
		}
		catch (error) {
			eventError('messageCreate', error);
		}
	},
};

const cleverbot = require('cleverbot-free');
const { typingSpeed } = require('../parameters.js');
const { executeEvent, eventError } = require('.');
const { isWhitelisted } = require('../whitelist-manager.js');
const { isMarkedAsIgnore, isFromUser, isEmpty, isAMention } = require('../message-analyzer.js');

// Called whenever the discord.js client observes a new message
const onMessage = async function(message) {
	const client = message.client;

	// Ignore messages if they are...
	// ... from the user
	if (isFromUser(message, client.user)) return;
	// ... empty (images, embeds, interactions)
	if (isEmpty(message)) return;
	// ... marked as ignore
	if (isMarkedAsIgnore(message)) return;
	// ... in a channel already responding to
	if (isThinking(message.channel)) return;
	// ... not whitelisted or forced reply
	if (!isWhitelisted(message.channel) && !isAMention(message, client.user)) return;

	console.log('Received new message'.system);
	console.log(indent(debugMessage(message), 1));

	// Clean up message, also used in generateContext()
	console.log('Cleaning up message'.system);
	let input = message.cleanContent;
	if (isAMention(message, client.user)) {
		input = replaceMentions(client.user.username, input);
	}
	input = replaceUnknownEmojis(input);
	input = input.trim();
	console.log(indent('Content: '.info + input, 1));

	// Generate or update conversation context (but only for whitelisted channels)
	if (isWhitelisted(message.channel)) {
		if (!hasContext(message.channel)) {
			console.log('Generating new channel context'.system);
			await generateContext(client, message.channel);
		}
		else {
			console.log('Updating channel context'.system);
			addToContext(message.channel, input);
		}
	}
	else {
		console.log('Skipping channel context generation'.system);
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
		console.log('\tResponse:'.info, response);

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
						console.error('\t' + client.debugFormatError(error));
						console.error('Failed to send message'.warning);
					});
				}
				// Use reply to respond directly if extra messages are in the way
				else {
					message.reply(response).then(() => {
						console.log('Sent reply successfully'.system);
						console.log();
					}).catch(error => {
						console.error('\t' + client.debugFormatError(error));
						console.error('Failed to send reply'.warning);
					});
				}

				// Update conversation context (but only for whitelisted channels)
				if (isWhitelisted(message.channel)) {
					addToContext(message.channel, response);
				}

				// Allow bot to think about new messages now
				stopThinking(message.channel);
			},
			timeTypeSec * 1000,
		);
	}).catch(error => {
		// Undo adding to context (but only for whitelisted channels)
		if (isWhitelisted(message.channel)) {
			removeLastMessageFromContext(message.channel);
		}

		// Stop thinking so bot can respond in future
		stopThinking(message.channel);

		// Log the error
		console.error('\t' + client.debugFormatError(error));
		console.error('Failed to generate response'.warning);

		// If error is timeout, then try again
		if (error.message === 'Response timeout of 10000ms exceeded' ||
		error === 'Failed to get a response after 15 tries' ||
		error.message === 'Response is an empty string') {
			console.log('Trying again'.system);
			console.log();
			executeEvent('messageCreate', message);
		}
		// If unknown error, then respond to message with error message
		else {
			console.log('Replying with error message'.system);
			console.log();
			client.sendErrorMessage(message, error);
		}
	});
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

// Indents strings that have more than one line
const indent = function(str, numTabs) {
	let tabs = '';
	while (numTabs > 0) {
		tabs += '\t';
		numTabs--;
	}
	return (tabs + str).replaceAll('\n', '\n' + tabs);
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
const generateContext = async function(client, channel) {
	context[channel.id] = [];
	let repliedTo = undefined;
	let lastMessageFromUser = false;

	// Fetch past messages
	const messages = await channel.messages.fetch({ limit: maxContextLength });
	messages.each(message => {
		// Skip ignored messages and empty messages
		if (isMarkedAsIgnore(message) || isEmpty(message)) return;
		// Skip messages that bot skipped in the past
		if (!isFromUser(message, client.user) && repliedTo !== undefined && message.id !== repliedTo) return;

		// Clean up message, also used in onMessage()
		let input = message.cleanContent;
		if (isAMention(message, client.user)) input = replaceMentions(client.user.username, input);
		input = replaceUnknownEmojis(input);

		// If there are two messages from other users in a row, make them the same message so cleverbot doesn't get confused
		if (!isFromUser(message, client.user) && !lastMessageFromUser && context[channel.id][0] !== undefined) {
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
		if (isFromUser(message, client.user) && message.reference !== null) {
			if (message.reference.messageId !== undefined) {
				repliedTo = message.reference.messageId;
			}
		}

		lastMessageFromUser = isFromUser(message, client.user);
	});

	return context[channel.id];
};

// Adds a message to the recorded past messages of a channel
const addToContext = function(channel, str) {
	if (!hasContext(channel)) return;
	context[channel.id].push(str);
	// Make sure context doesn't go over the max length
	if (context[channel.id].length > maxContextLength) {
		context[channel.id].shift();
	}
};

// Removes the most recent message from the recorded past messages of a channel
const removeLastMessageFromContext = function(channel) {
	if (!hasContext(channel)) return;
	context[channel.id].pop();
};

// Replaces @ mentions of the user with 'Cleverbot' to avoid confusing the Cleverbot AI
const replaceMentions = function(username, content) {
	return content.replaceAll('@' + username, 'Cleverbot');
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