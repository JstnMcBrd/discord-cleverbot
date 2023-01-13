module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		try {
			await onceReady(client);
		}
		catch (error) {
			eventError('ready', error);
		}
	},
};

const { ActivityType } = require('discord.js');
const { executeEvent, eventError } = require('./');
const { verify: verifyWhitelist, getWhitelist } = require('../whitelist-manager.js');
const { isMarkedAsIgnore, isEmpty, isFromUser } = require('../message-analyzer.js');

// Called once the client successfully logs in
const onceReady = async function(client) {
	console.log('Client ready'.system);
	console.log();

	setUserActivity(client);

	// Unlike setUserActivity and resumeConversations, verifyWhitelist will not repeat after startup
	await verifyWhitelist(client);

	await resumeConversations(client);
};

// Sets the acitivity of the bot to be 'Listening to /help'
const setUserActivity = function(client) {
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
		type: ActivityType.Listening,
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
	setTimeout(setUserActivity, repeatWait * 1000, client);
	console.log('Setting again in'.system, repeatWait, 'seconds'.system);
	console.log();
};

// Searchs for unread messages in whitelisted channels that were sent when the bot was offline, and responds to them
const resumeConversations = async function(client) {
	// How long to wait before trying again (seconds)
	const repeatWait = 30 * 60;
	const messageSearchDepth = 10;

	// Verify the whitelist first every time
	// TODO This is a temporary solution
	await verifyWhitelist(client);

	console.log('Searching for missed messages'.system);
	const toRespondTo = [];
	for (const channelID of getWhitelist()) {

		// Fetch the channel
		const channel = await client.channels.fetch(channelID);

		// Request the most recent messages of the channel
		let messages = await channel.messages.fetch({ limit: messageSearchDepth });

		// Convert map to array
		messages = messages.first(messages.size);

		// Search for messages that haven't been replied to
		for (const message of messages) {
			if (isEmpty(message) || isMarkedAsIgnore(message)) continue;
			if (!isFromUser(message, client.user)) toRespondTo.push(message);
			break;
		}
	}
	if (toRespondTo.length !== 0) {
		console.log('\tFound'.system, toRespondTo.length, 'missed messages'.system);
	}
	console.log('Searched for missed messages successfully'.system);

	// Check for missed messages at regular intervals
	setTimeout(resumeConversations, repeatWait * 1000, client);
	console.log('Searching again in'.system, repeatWait, 'seconds'.system);

	// Respond to missed messages
	if (toRespondTo.length !== 0) {
		console.log('Forwarding messages to message handler'.system);
		console.log();
		toRespondTo.forEach(message => executeEvent('messageCreate', message));
	}
	else {
		console.log();
	}
};