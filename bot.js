/* GLOBAL MODIFIERS */
//when this code was last changed
var lastUpdated = new Date(2022, 2, 7, 14, 00);	//month is 0-indexed
//how fast the bot sends messages (characters per second)
var typingSpeed = 6;
//the colors that the console output should use
var debugTheme = {
	system: ['green'],
	warning: ['yellow'],
	error: ['red'],
	info: ['gray']
}

/* LOG IN */
//this method connects the client with the discord API
var connect = function() {
	var retryWait = 10; //seconds
	
	console.log("Logging in".system);
	client.login(auth.token).then(() => {
		console.log("Logged in successfully".system);
		console.log();
	}).catch(error => {
		console.error("\t" + debugFormatError(error));
		console.log("Retrying connection in ".warning + retryWait + " seconds...".warning);
		console.log();
		//use connect() function again
		setTimeout(connect, retryWait*1000);
	});
}

/* EVENTS */
//this method is called once the client successfully logs in
var onceReady = async function() {
	console.log("Client ready".system);
	console.log();
	
	setUserActivity();
	await registerSlashCommands();
	resumeConversations();
}

//this method sets the acitivity of the bot to be "Listening to /help"
var setUserActivity = function() {
	var repeatWait = 5*60; //seconds
	activityOptions = {
		name: "/help",
		type: 'LISTENING',
		url: "https://www.cleverbot.com/"
	}
	
	//set the user's activity
	console.log("Setting user activity".system);
	presence = client.user.setActivity(activityOptions);
	
	//double check to see if it worked
	//this currently always returns true, but discord.js doesn't have a better way to check
	activity = presence.activities[0];
	var correct = false;
	if (activity !== undefined) {
		correct = activity.name === activityOptions.name &&
			activity.type === activityOptions.type &&
			activity.url === activityOptions.url;
	}
	if (correct)
		console.log("Set user activity successfully".system);
	else
		console.error("Failed to set user activity".warning);
	
	//set user activity at regular intervals
	setTimeout(setUserActivity, repeatWait*1000);
	console.log("Setting again in ".system + repeatWait + " seconds".system);
	console.log();
}

//this method registers commands with discord's new slash command API
var registerSlashCommands = async function() {
	console.log("Implementing commands".system);
	
	console.log("\tLoading command files".system);
	
	//collect command scripts
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	
	//add command scripts to list of commands
	client.commands = new Discord.Collection();
	var commands = [];
	for (const file of commandFiles) {
		const command = require("./commands/" + file);
		client.commands.set(command.data.name, command);
		commands.push(command.data.toJSON());
	}
	
	console.log("\tLoaded command files successfully".system);

	//register commands with discord REST service
	console.log("\tRegistering slash commands".system);
	const rest = new REST({ version: '10' }).setToken(auth.token);
	await rest.put(
		Routes.applicationCommands(client.user.id),
		{ body: commands }
	);
	console.log("\tRegistered slash commands successfully".system);
	
	console.log("Implemented commands successfully".system);
	console.log();
}

//this method searchs for unread messages in whitelisted channels that were sent when the bot was offline, and responds to them
var resumeConversations = async function() {
	var repeatWait = 30*60; //seconds
	var messageSearchDepth = 10;
	
	console.log("Searching for missed messages".system);
	var toRespondTo = [];
	try {
		var whitelist = getWhitelist();
		for (var c = 0; c < whitelist.length; c++) {
			channelID = whitelist[c];
			
			//fetch the channel
			let channel = await client.channels.fetch(channelID).catch(error => {
				//if the channel doesn't exist, remove it from the whitelist
				if (error.message === "Unknown Channel" || error.message === "Missing Access") {
					console.error("\tInvalid channel ID found in whitelist (".error + channelID + ")".error);
					removeFromWhitelist(channelID);
					console.log("\tInvalid channel ID removed from whitelist (".warning + channelID + ")".warning);
				} else {
					throw error;
				}
			});
			//end this iteration if the "unknown channel" error was caught above
			if (channel === undefined) continue;
			
			//request the most recent messages of the channel
			let messages = await channel.messages.fetch({ limit: messageSearchDepth });
			
			//convert map to array
			messages = messages.first(messages.size);
			
			//search for messages that haven't been replied to
			for (m = 0; m < messages.length; m++) {
				var message = messages[m];
				if (isEmptyMessage(message) || isMarkedAsIgnore(message)) continue;
				if (!isFromUser(message)) toRespondTo.push(message);
				break;
			}
		}
	}
	catch (error) {
		console.error("\t" + debugFormatError(error));	//log the error
		console.log("Failed to search for missed messages".warning);
	}
	if (toRespondTo.length !== 0)
		console.log("\tFound ".system + toRespondTo.length + " missed messages".system);
	console.log("Searched for missed messages successfully".system);
	
	//check for missed messages at regular intervals
	setTimeout(resumeConversations, repeatWait*1000);
	console.log("Searching again in ".system + repeatWait + " seconds".system);
	
	//respond to missed messages
	if (toRespondTo.length !== 0) {
		console.log("Forwarding messages to message handler".system);
		console.log();
		toRespondTo.forEach(message => onMessage(message));
	} else {
		console.log();
	}
}

//this method is called whenever the discord.js client encounters an error
var onError = function(error) {
	console.log();
	console.error("Discord Client encountered error".warning);
	console.error("\t", debugFormatError(error));
	console.log();
}

//this method is called whenever the discord.js client receives an interaction
//usually means a slash command
var onInteraction = async function(interaction) {
	//ignore any interactions that are not commands
	if (!interaction.isCommand()) return;
	console.log("Received command interaction".system);
	console.log("\t" + debugInteraction(interaction));
	
	//ignore any commands that are not recognized
	if (!client.commands.has(interaction.commandName)) return;
	console.log("Command recognized".system);
	
	//give additional information to the interaction to be passed to the command script
	interaction.extraInfo = {
		lastUpdated: lastUpdated,
		addToWhitelist: addToWhitelist,
		removeFromWhitelist: removeFromWhitelist
	}

	//execute the command script
	console.log("Executing command".system);
	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.error("\t" + debugFormatError(error));
		console.error("Failed to execute command".warning);
		console.log();
		sendErrorMessage(interaction, error);
		return;
	}
	console.log("Command executed successfully".system);
	console.log();
}

//this method is called whenever the discord.js client observes a new message
var onMessage = async function(message) {
	//ignore messages if they are...
	if (isFromUser(message)) return;		//from the user
	if (isEmptyMessage(message)) return;	//empty (images, embeds, interactions)
	if (isMarkedAsIgnore(message)) return;	//marked as ignore
	if (isThinking(message.channel)) return;//in a channel already responding to
	if (!isWhitelisted(message.channel) &&	//not whitelisted or forced reply
		!isAMention(message))
		return;
		
	console.log("Received new message".system);	
	console.log(indent(debugMessage(message),1));
	
	//clean up message, also used in generateContext()
	console.log("Cleaning up message".system);
	var input = message.cleanContent;
	if (isAMention(message))
		input = replaceMentions(input);
	input = replaceUnknownEmojis(input);
	console.log(indent("Content: ".info + input, 1));
	
	//generate or update conversation context
	if (!hasContext(message.channel)) {
		console.log("Generating new channel context".system);
		await generateContext(message.channel);
	}
	else {
		addToContext(message.channel, input);
	}
	
	//prevent bot from responding to anything else while it thinks
	startThinking(message.channel);
	
	//actually generate response
	console.log("Generating response".system);
	cleverbot(input, getContext(message.channel)).then(response => {
		//sometimes cleverbot goofs and returns an empty response
		if (response === "") {
			var error = new Error();
			error.name = "Invalid Cleverbot Response";
			error.message = "Response is an empty string";
			throw error;
		}
		
		console.log("Generated response successfully".system);
		console.log("\tResponse: ".info + response);
	
		//determine how long to show the typing indicator before sending the message
		var timeTypeSec = response.length / typingSpeed; //seconds
		message.channel.sendTyping(); //will automatically stop typing when message sends
		
		//send the message once the typing time is over
		console.log("Sending message".system);
		setTimeout(
			function() {
				//respond normally if no extra messages have been sent in the meantime
				if (message.channel.lastMessageId === message.id)
					message.channel.send(response).then(() => {
						console.log("Sent message successfully".system);
						console.log();
					}).catch(error => {
						console.error("\t" + debugFormatError(error));
						console.error("Failed to send message".warning);
					});
				//use reply to respond directly if extra messages are in the way
				else									
					message.reply(response).then(() => {
						console.log("Sent reply successfully".system);
						console.log();
					}).catch(error => {
						console.error("\t" + debugFormatError(error));
						console.error("Failed to send reply".warning);
					});
				
				//update conversation context
				addToContext(message.channel, response);
				
				//allow bot to think about new messages now
				stopThinking(message.channel);
			}, 
			timeTypeSec * 1000	//milliseconds
		);
	}).catch(error => {
		//undo adding to context
		removeLastMessageFromContext(message.channel);
		
		//stop thinking so bot can respond in future
		stopThinking(message.channel);
		
		//log the error
		console.error("\t" + debugFormatError(error));		
		console.error("Failed to generate response".warning);
		
		//if error is timeout, then try again
		if (error.message === "Response timeout of 10000ms exceeded" ||
		error === "Failed to get a response after 15 tries" ||
		error.message === "Response is an empty string") {
			console.log("Trying again".system);
			console.log();
			onMessage(message);								
		}
		//if unknown error, then respond to message with error message
		else {
			console.log("Replying with error message".system);
			console.log();
			sendErrorMessage(message, error);					
		}
	});
}

//this method replaces @ mentions of the user with "Cleverbot" to avoid confusing the Cleverbot AI
var replaceMentions = function(content) {
	return content.replaceAll("@​"+client.user.username, "Cleverbot");
	//there's a special character after the @, but it doesn't show up in any text editor
	//don't delete it! Otherwise, the bot will fail to recognize mentions
}

//this method replaces unknown discord emojis with the name of the emoji as *emphasized* text to avoid confusing the Cleverbot AI
var replaceUnknownEmojis = function(content) {
	//start with custom emojis
	content = content.replaceAll(/<:[\w\W][^:\s]+:\d+>/g, match => {
		match = match.replace("<:", "");
		match = match.replace(/:\d+>/g, "");
		match = match.replace("_", " ");
		return "*"+match+"*";
	});
	//now replace any unknown emojis that aren't custom
	content = content.replaceAll(":", "*").replaceAll("_", " ");
	return content;
}

//this method responds to a message with an error message
var sendErrorMessage = function(message, error) {
	//format the message as an embed
	var embed = {
		title: "Error",
		description: "I encountered an error while trying to respond. Please forward this to my developer.",
		color: 16711680, //red
		fields: [
			{
				name: "Message",
				value: "``" + error + "``"
			}
		]
	}
	
	//send the error message as a reply
	console.log("Sending error message".system);
	message.reply({embeds: [embed]}).then(() => {
		console.log("Error message sent successfully".system);
		console.log();
	}).catch(error => {
		console.error("\t" + debugFormatError(error));
		console.log("Failed to send error message".warning);
		console.log();
	});
}

/* MESSAGES */
//this method recognizes when a message is prepended with "> ", which tells the bot not to respond
var isMarkedAsIgnore = function(message) {
	return message.cleanContent.substring(0,2) === "> ";
}

//this method recognizes when a message is from the current user
var isFromUser = function(message) {
	return message.author.id === client.user.id;
}

//this method recognizes when a message is empty (mostly likely an image)
var isEmptyMessage = function(message) {
	return message.cleanContent === "";
}

//this method recognizes when a message @ mentions the current user
var isAMention = function(message) {
	return message.mentions.has(client.user);
}

/* WHITELIST */
//this method reads the whitelist from memory
var getWhitelist = function() {
	return JSON.parse(fs.readFileSync(whitelistFilePath));
}

//this method writes the whitelist to memory
var setWhitelist = function(whitelist) {
	fs.writeFileSync(whitelistFilePath, JSON.stringify(whitelist));
}

//this method adds a channel to the whitelist and updates memory
var addToWhitelist = function(channel) {
	//will work with a channel object or just a channel ID
	var channelID = channel.id;
	if (channelID === undefined)
		channelID = channel;
	
	//if the channel is not already in the whitelist, add it
	if (!isWhitelisted(channelID)) {
		whitelist = getWhitelist();
		whitelist.push(channelID);
		setWhitelist(whitelist);
		return true;
	}
	return false;
}

//this method removes a channel from the whitelist and updates memory
var removeFromWhitelist = function(channel) {
	//will work with a channel object or just a channel ID
	var channelID = channel.id;
	if (channelID === undefined)
		channelID = channel;
	
	//if the channel is in the whitelist, remove it
	if (isWhitelisted(channelID)) {
		whitelist = getWhitelist();
		whitelist.splice(whitelist.indexOf(channelID), 1);
		setWhitelist(whitelist);
		return true;
	}
	return false;
}

//this method checks if a channel is in the whitelist
var isWhitelisted = function(channel) {
	//will work with a channel object or just a channel ID
	var channelID = channel.id;
	if (channelID === undefined)
		channelID = channel;
	
	return getWhitelist().indexOf(channelID) !== -1;
}

/* THINKING */
//to keep track of whether the bot is already generating a response for each channel
var thinking = {
	//channelID: true/false
};

//this method checks to see if the bot is currently generating a response in a channel
var isThinking = function(channel) {
	return thinking[channel.id];
}

//this method records that the bot is currently generating a response in the channel
var startThinking = function(channel) {
	thinking[channel.id] = true;
}

//this method records that the bot has finished generating a response in the channel
var stopThinking = function(channel) {
	thinking[channel.id] = false;
}

/* CONTEXT */
//to keep track of the past conversation for each channel
var context = {
	//channelID: ["past","messages"]
}
var maxContextLength = 50;

//this method returns the past messages of the channel
var getContext = function(channel) {
	return context[channel.id];
}

//this method checks whether the past messages of the channel have been recorded yet
var hasContext = function(channel) {
	return context[channel.id] !== undefined;
}

//this method fetches and records the past messages of the channel
var generateContext = async function(channel) {
	context[channel.id] = [];
	var repliedTo = undefined;
	var lastMessageFromUser = false;
	
	//fetch past messages
	let messages = await channel.messages.fetch({limit: maxContextLength});
	messages.each(message => {
		//skip ignored messages and empty messages
		if (isMarkedAsIgnore(message) || message.cleanContent === "") return;
		//skip messages that bot skipped in the past
		if (!isFromUser(message) && repliedTo !== undefined && message.id !== repliedTo) return;
		
		//clean up message, also used in onMessage()
		var input = message.cleanContent;
		if (isAMention(message))
			input = replaceMentions(input);
		input = replaceUnknownEmojis(input);
		
		//if there are two messages from other users in a row, make them the same message so cleverbot doesn't get confused
		if (!isFromUser(message) && !lastMessageFromUser && context[channel.id][0] !== undefined)
			context[channel.id][0] = input + "\n" + context[channel.id][0];
		else
			context[channel.id].unshift(input);
		
		//if the message is from self, and it replies to another message,
		//record what that message is so we can skip all the ignored messages in between (see above)
		if (message.id === repliedTo)
			repliedTo = undefined;	//reset for the future
		if (isFromUser(message) && message.reference !== null)
			if (message.reference.messageId !== undefined)
				repliedTo = message.reference.messageId;
			
		lastMessageFromUser = isFromUser(message);
	});
	
	return context[channel.id];
}

//this method adds a message to the recorded past messages of a channel
var addToContext = function(channel, str) {
	context[channel.id].push(str);
	if (context[channel.id].length > maxContextLength)
		context[channel.id].shift();
}

//this method removes the most recent message from the recorded past messages of a channel
var removeLastMessageFromContext = function(channel) {
	context[channel.id].pop();
}

/* DEBUG */
//this method is for indenting strings that have more than one line
var indent = function(str, numTabs) {
	var tabs = "";
	while (numTabs > 0) {
		tabs += '\t';
		numTabs--;
	}
	return (tabs + str).replaceAll('\n', '\n'+tabs);
}

//this method takes either a string or an Error and gives them the error color for the console
var debugFormatError = function(error) {
	if (typeof(error) === 'string')
		return error.error;
	var e = new Error();
	if (error.name !== undefined)
		e.name = error.name.error;
	e.message = error.message;
	return e;
}

//this method logs important information about a message to the console
var debugMessage = function(message) {
	str  = "MESSAGE".info;
	str += "\nContent: ".info + message.cleanContent;
	str += "\nAuthor:  ".info + message.author.tag + " (".info + message.author.id + ")".info;
	str += "\nChannel: ".info + message.channel.name + " (".info + message.channel.id + ")".info;
	//compensate for DMs
	if (message.guild !== null)
		str += "\nGuild:   ".info + message.guild.name + " (".info + message.guild.id + ")".info;
	return str;
}

//this method logs important information about an interaction to the console
var debugInteraction = function(interaction) {
	str  = "INTERACTION".info;
	if (interaction.isCommand())
		str += "\nCommand: ".info + interaction.commandName;
	str += "\nUser:    ".info + interaction.user.tag + " (".info + interaction.user.id + ")".info;
	str += "\nChannel: ".info + interaction.channel.name + " (".info + interaction.channel.id + ")".info;
	//compensate for DMs
	if (interaction.guild !== null)
		str += "\nGuild:   ".info + interaction.guild.name + " (".info + interaction.guild.id + ")".info;
	return str;
}

/* THE ACTION */
console.log("Importing packages");//.system);	//won't work yet because colors isn't imported

//load in all the required packages
var fs = require('fs');
var colors = require('colors');
var Discord = require('discord.js');
var cleverbot = require('cleverbot-free');
var { REST } = require('@discordjs/rest');
var { Routes } = require('discord-api-types/v10');

//set the console debug colors
colors.setTheme(debugTheme);

//create a discord client and give it the callback methods
var client = new Discord.Client({
	partials: [
		'CHANNEL'
	],
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Discord.Intents.FLAGS.DIRECT_MESSAGES,
		Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING
	]
});
client.on('error', error => onError(error));
client.once('ready', onceReady);
client.on('interactionCreate', interaction => onInteraction(interaction));
client.on('messageCreate', message => onMessage(message));

console.log("Imported packages successfully".system);
console.log();

//load memory files
console.log("Loading memory files".system);

//was login info provided?
if (process.argv[2] === undefined) {
	var error = new Error();
	error.name = "Missing Console Argument";
	error.message = "Account directory name not provided";
	error.message += "\n\tPlease follow this usage:";
	error.message += "\n\tnode " + process.argv[1] + " " + "[ACCOUNT DIRECTORY NAME]".underline;
	throw debugFormatError(error);
}
var filePath = "./accounts/" + process.argv[2] + "/";
var authFilePath = filePath + "auth.json";
var whitelistFilePath = filePath + "whitelist.json";

//does the necessary directory exist?
if (!fs.existsSync(filePath)) {
	var error = new Error();
	error.name = "Missing Account Directory".error;
	error.message = "Account directory does not exist";
	error.message += "\n\tPlease create a directory (" + filePath + ") to contain the account's memory files";
	throw debugFormatError(error);
}

//do the necessary files exist?
if (!fs.existsSync(authFilePath) || !fs.existsSync(whitelistFilePath)) {
	var error = new Error();
	error.name = "Missing Memory Files".error;
	error.message = "Account directory missing essential memory files";
	error.message += "\n\tPlease create the necessary files (" + authFilePath + ") (" + whitelistFilePath + ")";
	throw debugFormatError(error);
}
var auth = require(authFilePath);

console.log("Loaded memory files successfully".system);
console.log();

//let's begin
connect();