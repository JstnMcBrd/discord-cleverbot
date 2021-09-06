/*
TODO
*/

/*
BUGS
*/

/* GLOBAL MODIFIERS */
var lastUpdated = new Date(2021, 8, 6, 1, 30); //month is 0-indexed
var typingSpeed = 6;	//how fast the bot sends messages (characters per second)

/* LOG IN */
var connect = function() {
	console.log("Logging in".system);
	client.login(auth.token).then(() => {
		console.log("Logged in successfully".system);
		console.log();
	}).catch(error => {
		var retryWait = 10; //seconds
	
		console.error("\t" + debugFormatError(error));
		console.log("Retrying connection in ".warning + retryWait + " seconds...".warning);
		console.log();
		setTimeout(connect, retryWait*1000); //use connect() function again
	});
}

/* EVENTS */
var onceReady = async function() {
	console.log("Client ready".system);
	console.log();
	
	setUserActivity();
	await registerSlashCommands();
	resumeConversations();
}
var setUserActivity = function() {
	var repeatWait = 5*60; //seconds
	
	console.log("Setting user activity".system);
	client.user.setActivity("/help", {
		url: "https://www.cleverbot.com/",
		type: 'LISTENING'
	});
	setTimeout(setUserActivity, repeatWait*1000); //set user activity at regular intervals
	console.log("Set user activity successfully".system);
	console.log("Setting again in ".system + repeatWait + " seconds".system);
	console.log();
}
var registerSlashCommands = async function() {
	console.log("Implementing commands".system);
	
	console.log("\tLoading command files".system);
	client.commands = new Discord.Collection();
	var commands = [];
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));	//collect command scripts
	for (const file of commandFiles) {
		const command = require("./commands/" + file);
		client.commands.set(command.data.name, command);
		commands.push(command.data.toJSON());
	}
	console.log("\tLoaded command files successfully".system);

	console.log("\tRegistering slash commands".system);
	const rest = new REST({ version: '9' }).setToken(auth.token);
	await rest.put(
		Routes.applicationCommands(client.user.id), //, "292111506819252227"),	//unnecessary server id
		{ body: commands }
	);
	console.log("\tRegistered slash commands successfully".system);
	
	console.log("Implemented commands successfully".system);
	console.log();
}
var resumeConversations = async function() {
	var messageSearchDepth = 10;
	
	console.log("Searching for missed messages".system);
	var toRespondTo = [];
	var whitelist = getWhitelist();
	for (c = 0; c < whitelist.length; c++) {
		channelID = whitelist[c];
		let channel = await client.channels.fetch(channelID).catch(error => {
			if (error.message === "Unknown Channel" || error.message === "Missing Access") {	//clean up the whitelist
				console.error("\tInvalid channel ID found in whitelist (".error + channelID + ")".error);
				removeFromWhitelist(channelID);
				console.log("\tInvalid channel ID removed from whitelist (".warning + channelID + ")".warning);
			} else {
				throw error;
			}
		});
		if (channel === undefined) continue;	//only necessary because "unknown channel" error doesn't end iteration
		
		let messages = await channel.messages.fetch({ limit: messageSearchDepth });
		
		messages = messages.first(messages.size);	//convert map to array
		for (m = 0; m < messages.length; m++) {
			var message = messages[m];
			if (isEmptyMessage(message) || isMarkedAsIgnore(message)) continue;
			if (!isFromUser(message)) toRespondTo.push(message);
			break;
		}
	}
	if (toRespondTo.length !== 0)
		console.log("\tFound ".system + toRespondTo.length + " missed messages".system);

	console.log("Searched for missed messages successfully".system);
	
	if (toRespondTo.length !== 0) {
		console.log("Forwarding to message handler".system);
		console.log();
		toRespondTo.forEach(message => onMessage(message));
	} else {
		console.log();
	}
}

var onError = function(error) {
	console.log();
	console.error("Discord Client encountered error".warning);
	console.error("\t", debugFormatError(error));
	console.log();
}

var onInteraction = async function(interaction) {
	if (!interaction.isCommand()) return;
	console.log("Received command interaction".system);
	console.log("\t" + debugInteraction(interaction));
	if (!client.commands.has(interaction.commandName)) return;
	console.log("Command recognized".system);
	
	interaction.extraInfo = {
		lastUpdated: lastUpdated,
		addToWhitelist: addToWhitelist,
		removeFromWhitelist: removeFromWhitelist		
	}

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

var onMessage = async function(message) {
											//ignore messages if they...
	if (isFromUser(message)) return;		//are from the user
	if (isEmptyMessage(message)) return;	//are empty (images, embeds, interactions)
	if (isMarkedAsIgnore(message)) return;	//are marked as ignore
	if (isThinking(message.channel)) return;//are in channel already responding to
	if (!isWhitelisted(message.channel) &&	//are not whitelisted or forced reply
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
	console.log(indent("Content: ".info + message.cleanContent, 1));
	
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
		console.log("Generated response successfully".system);
		console.log("\tResponse: ".info + response);
	
		var timeTypeSec = response.length / typingSpeed;
		message.channel.sendTyping();		//will automatically stop typing when message sends
		console.log("Sending message".system);
		setTimeout(
			function() {
				message.channel.messages.fetch({limit: 1}).then(lastMessages => {
					if (lastMessages.first().id === message.id)	//respond normally if no extra messages have been sent in the meantime
						message.channel.send(response).then(() => {
							console.log("Sent message successfully".system);
							console.log();
						}).catch(error => {
							console.error("\t" + debugFormatError(error));
							console.error("Failed to send message".warning);
						});
					else										//use reply to respond directly if extra messages are in the way
						message.reply(response).then(() => {
							console.log("Sent reply successfully".system);
							console.log();
						}).catch(error => {
							console.error("\t" + debugFormatError(error));
							console.error("Failed to send reply".warning);
						});

					addToContext(message.channel, response);	//update conversation context
					stopThinking(message.channel);				//allow bot to think about new messages now
				});
			}, 
			timeTypeSec * 1000	//milliseconds
		);
	}).catch(error => {
		removeLastMessageFromContext(message.channel);		//undo adding to context
		stopThinking(message.channel);						//stop thinking so bot can respond in future
		console.error("\t" + debugFormatError(error));	//log the error
		console.error("Failed to generate response".warning);
		if (error.message === "Response timeout of 10000ms exceeded" ||
		error === "Failed to get a response after 15 tries") {
			console.log("Trying again".system);
			console.log();
			onMessage(message);								//if error is timeout, then try again
		}
		else {
			console.log("Replying with error message".system);
			console.log();
			sendErrorMessage(message, error);				//if unknown error, then respond to message with error message
		}
	});
}
var replaceMentions = function(content) {
	return content.replaceAll("@​"+client.user.username, "Cleverbot");
	//there's a special character after the @, but it doesn't show up in any text editor
	//don't delete it! Otherwise, the bot will fail to recognize mentions
}
var replaceUnknownEmojis = function(content) {
	return content.replaceAll(/:.*:/g, "\0");
	//previously, all known emojis were converted to their unicode equivalents with message.cleanContent
	//this replaces any leftover unknown emojis with null characters
}

var sendErrorMessage = function(message, error) {
	console.log("Sending error message".system);
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
var isMarkedAsIgnore = function(message) {
	return message.cleanContent.substring(0,2) === "> ";
}

var isFromUser = function(message) {
	return message.author.id === client.user.id;
}

var isEmptyMessage = function(message) {
	return message.cleanContent === "";
}

var isAMention = function(message) {
	return message.mentions.has(client.user);
}

/* WHITELIST */
var getWhitelist = function() {
	return JSON.parse(fs.readFileSync(whitelistFilePath));
}

var setWhitelist = function(whitelist) {
	fs.writeFileSync(whitelistFilePath, JSON.stringify(whitelist));
}

var addToWhitelist = function(channel) {
	var channelID = channel.id;
	if (channelID === undefined)
		channelID = channel;
	
	if (!isWhitelisted(channelID)) {
		whitelist = getWhitelist();
		whitelist.push(channelID);
		setWhitelist(whitelist);
		return true;
	}
	return false;
}

var removeFromWhitelist = function(channel) {
	var channelID = channel.id;
	if (channelID === undefined)
		channelID = channel;
	
	if (isWhitelisted(channelID)) {
		whitelist = getWhitelist();
		whitelist.splice(whitelist.indexOf(channelID), 1);
		setWhitelist(whitelist);
		return true;
	}
	return false;
}

var isWhitelisted = function(channel) {
	var channelID = channel.id;
	if (channelID === undefined)
		channelID = channel;
	
	return getWhitelist().indexOf(channelID) !== -1;
}

/* THINKING */
var thinking = {		//to keep track of whether the bot is already generating a response for each channel
	//channelID: true/false
};

var isThinking = function(channel) {
	return thinking[channel.id];
}

var startThinking = function(channel) {
	thinking[channel.id] = true;
}

var stopThinking = function(channel) {
	thinking[channel.id] = false;
}

/* CONTEXT */
var context = {			//to keep track of the past conversation for each channel
	//channelID: ["past","messages"]
}
var maxContextLength = 50;

var getContext = function(channel) {
	return context[channel.id];
}

var hasContext = function(channel) {
	return context[channel.id] !== undefined;
}

var generateContext = async function(channel) {
	context[channel.id] = [];
	var repliedTo = undefined;
	var lastMessageFromUser = false;
	
	let messages = await channel.messages.fetch({limit: maxContextLength});
	messages.each(message => {
		if (isMarkedAsIgnore(message) || message.cleanContent === "") return;	//skip ignored messages and empty messages
		if (!isFromUser(message) && repliedTo !== undefined && message.id !== repliedTo) return; //skip messages that bot skipped in the past
		
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

var addToContext = function(channel, str) {
	context[channel.id].push(str);
	if (context[channel.id].length > maxContextLength)
		context[channel.id].shift();
}

var removeLastMessageFromContext = function(channel) {
	context[channel.id].pop();
}

/* DEBUG */
var indent = function(str, numTabs) {	//this is for indenting strings that have more than one line
	var tabs = "";
	while (numTabs > 0) {
		tabs += '\t';
		numTabs--;
	}
	return (tabs + str).replaceAll('\n', '\n'+tabs);
}

var debugFormatError = function(error) {
	if (error.name !== undefined)
		error.name = error.name.error;
	return error;
}

var debugMessage = function(message) {
	str  = "MESSAGE".info;
	str += "\nContent: ".info + message.cleanContent;
	str += "\nAuthor:  ".info + message.author.tag + " (".info + message.author.id + ")".info;
	str += "\nChannel: ".info + message.channel.name + " (".info + message.channel.id + ")".info;
	str += "\nGuild:   ".info + message.guild.name + " (".info + message.guild.id + ")".info;
	return str;
}

var debugInteraction = function(interaction) {
	str  = "INTERACTION".info;
	if (interaction.isCommand())
		str += "\nCommand: ".info + interaction.commandName;
	str += "\nUser:    ".info + interaction.user.tag + " (".info + interaction.user.id + ")".info;
	str += "\nChannel: ".info + interaction.channel.name + " (".info + interaction.channel.id + ")".info;
	str += "\nGuild:   ".info + interaction.guild.name + " (".info + interaction.guild.id + ")".info;
	return str;
}

/* THE ACTION */
//requires
console.log("Importing packages");//.system);	//won't work yet because colors isn't imported
var fs = require('fs');
var colors = require('colors');
colors.setTheme({
	system: ['green'],
	warning: ['yellow'],
	error: ['red'],
	info: ['gray']
});
var Discord = require('discord.js');
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
var cleverbot = require('cleverbot-free');
var { REST } = require('@discordjs/rest');
var { Routes } = require('discord-api-types/v9');
console.log("Imported packages successfully".system);
console.log();

//load memory files
console.log("Loading memory files".system);
if (process.argv[2] === undefined) {										//was login info provided?
	var error = new Error();
	error.name = "Missing Console Argument";
	error.message = "Account directory name not provided";
	error.message += "\n\tPlease follow this usage:";
	error.message += "\n\tnode " + process.argv[1] + " " + "[ACCOUNT DIRECTORY NAME]".underline;
	throw debugFormatError(error);
}
var filePath = "./" + process.argv[2] + "/";
var authFilePath = filePath + "auth.json";
var whitelistFilePath = filePath + "whitelist.json";
if (!fs.existsSync(filePath)) {												//does the necessary directory exist?
	var error = new Error();
	error.name = "Missing Account Directory".error;
	error.message = "Account directory does not exist";
	error.message += "\n\tPlease create a directory (" + filePath + ") to contain the account's memory files";
	//var necessaryFilePath = process.argv[1].slice(0, process.argv[1].lastIndexOf('\\')+1) + process.argv[2] + "\\";
	throw debugFormatError(error);
}
if (!fs.existsSync(authFilePath) || !fs.existsSync(whitelistFilePath)) {	//do the necessary files exist?
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