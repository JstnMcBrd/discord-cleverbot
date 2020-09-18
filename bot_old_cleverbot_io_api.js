//rewrite debugging to be more effective and include color
	//make sure to log authors and stuff
//rewrite message system to work in attachments
//rewrite command system
console.log("Importing Packages");
const Discord = require("discord.js");
var cleverbot = require('cleverbot.io');
var colors = require('colors');
	colors.setTheme({
		system: ['cyan'],
		warning: ['yellow'],
		error: ['red'],
		info: ['green']
	});
var fs = require('fs');
console.log("Packages Imported\n".system);

console.log("Loading Authorization and Memory".system);
if (process.argv[2] === undefined) {	
	console.log("\tAccount path not defined after process instantiation".warning);
	console.log("Loading Authorization and Memory Failed".error);
	console.log("Exiting Process".system);
	process.exit();
}

var filePath = './' + process.argv[2] + '/';
//if folder doesn't exist (like if they misspelled it)
if (!fs.existsSync(filePath)) 
{
	console.log("\tThe specified account path does not exist".warning);
	console.log("Loading Authorization and Memory Failed".error);
	console.log("Exiting Process".system);
	process.exit();
}
//if one or both files don't exist (like if they set up the account files wrong)
if (!fs.existsSync(filePath + 'auth.json') || !fs.existsSync(filePath + 'memory.json'))
{
	console.log("\tAccount path is missing essential files".warning);
	console.log("Loading Authorization and Memory Failed".error);
	console.log("Exiting Process".system);
	process.exit();
}

var auth = require(filePath + 'auth.json');
var memory = JSON.parse(fs.readFileSync(filePath + 'memory.json'));
console.log("Authorization and Memory Loaded\n".system);

// Initialize Discord Bot
console.log("Initializing Client".system);
const client = new Discord.Client();
console.log("Client Initialized\n".system);

var ai;
//var thinking = false;
var alreadyThinking = {};

var typingSpeed = 10;

var connect = function() {
	console.log("Logging in".system);
	client.login(auth.token).catch(connectionError);
}

client.on('ready', () => {
	console.log("Login Complete, Client Ready".system);
    console.log("\tLogged in as:".system);
	console.log("\t\tUsername: ".system + client.user.tag);
	console.log("\t\tUserID:   ".system + client.user.id);

	console.log("Initializing Cleverbot AI".system);
	ai = new cleverbot("xw0cKXJ62UB5brkX", "tVP97UtY67KYZJLfElfo76xe8Sa5xHxq");
	ai.setNick("Test")
	ai.create(function (err, session) { } );
	console.log("Cleverbot AI Initialized\n".system);
	
	client.user.setActivity("cleverbot.io");
	
	//GUILDS LIST
	console.log("\tGuilds List".info);
	var guildsArr = client.guilds.array();	
	for (var i = 0; i < guildsArr.length; i++)
	{
		console.log("\t\t" + guildsArr[i].name + " (".info + guildsArr[i].id + ")".info);
	}
	console.log("\tEnd of Guilds List\n".info);
	
	//WHITELISTED CHANNELS LIST
	console.log("\tWhitelisted Channels List".info);
	var channelsArr = client.channels.array();
	for (var i = 0; i < channelsArr.length; i++)
	{
		if (isWhitelisted(channelsArr[i].id))
		{
			var channelName;
			var channelID;
			var guildName;
			var guildID;
			if (channelsArr[i].type === 'dm')
			{
				channelName = channelsArr[i].recipient.tag;
				channelID = channelsArr[i].id;
				guildName = "Direct Message";
				guildID = "NA";
			}
			else if (channelsArr[i].type === 'text')
			{
				channelName = channelsArr[i].name;
				channelID = channelsArr[i].id;
				guildName = channelsArr[i].guild.name;
				guildID = channelsArr[i].guild.id;
			}
			
			console.log("\t\t" + channelName + " (".info + channelID + ")".info);
			console.log("\t\t\t" + guildName + " (".info + guildID + ")".info);
		}
	}
	console.log("\tEnd of Whitelisted Channels List\n".info);
	
	//SCANNING FOR UNREAD MESSAGES
	console.log("Scanning Previous Messages".system);	
	for (var i = 0; i < channelsArr.length; i++)
	{					
		//if on whitelisted channel, and not voice channel, and there is a last message
		if (isWhitelisted(channelsArr[i].id) && channelsArr[i].type !== "voice")
		{			
			channelsArr[i].fetchMessages({ limit: 10 }).then(messages => {	
				//make it so the bot goes through the messages and ignores ones that have commands or > in them			
				var message = messages.array()[0];
				if (message === undefined || message.author.id === client.user.id) return;
				
				//debug info
				var guildName;
				var guildID;
				var channelName;
				var channelID = message.channel.id;
				var authorTag = message.author.tag;;
				var authorID = message.author.id;
				var authorBot = message.author.bot;
				if (message.channel.type === 'dm')
				{
					guildName = "Direct Message";
					guildID = "NA";
					channelName = message.channel.recipient.tag; 
				}
				else if (message.channel.type === 'text')
				{
					guildName = message.channel.guild.name;
					guildID = message.channel.guild.id;
					channelName = message.channel.name;
				}					
				console.log("\tFound New Unread Message".system);
				console.log("\t\tAuthor:  ".system + authorTag + " (".system + authorID + ")".system);
				console.log("\t\tBot:     ".system + authorBot);
				console.log("\t\tGuild:   ".system + guildName + " (".system + guildID + ")".system);
				console.log("\t\tChannel: ".system + channelName + " (".system + channelID + ")".system);
				console.log("\t\tMessage: ".system + message.cleanContent);
				console.log("\tReferring to Response Generation".system);
				generateAndRespond(message);
				
			}).catch(console.error);
		}
	}
	console.log("Done Scanning".system);

});

var connectionError = function() {
	console.log("Connection Error!".error);
	console.log("Retrying connection in 1 second\n".error);
	setTimeout(connect, 1000); //use connect() function in 1 second
}

client.on('reconnecting', () => {
	console.log("Attempting to Reconnect...\n".error);
});

client.on('error', error => {
	console.log("Connection Error: ".error + error);
});

client.on('message', message => {
	if (message.author.id === client.user.id) return;
	if (message.content === "") return; //ignore media messages w/o text
	
	//debug info
	var guildName;
		if (message.channel.type === 'dm') guildName = "Direct Message";
		else if (message.channel.type === 'text') guildName = message.channel.guild.name;
	var channelName;
		if (message.channel.type === 'dm') channelName = message.channel.recipient.tag;
		else if (message.channel.type === 'text') channelName = message.channel.name;
	var channelID;
		channelID = message.channel.id;
		
	if (isAMention(message.content) || message.channel.type === 'dm') //treat DMs as commands or always respond
	{
		//console.log("Is a mention or DM");
		
		var cmd = removeMention(message.content);
		cmd = cmd.toLowerCase();
		cmd = cmd.trim();
		if (cmd.charAt(0) === '!') //is a command
		{
			cmd = cmd.replace("!", "");
			if (cmd === "whitelist" || cmd === "enable" || cmd == "allow") //WHITELIST
			{
				if (message.channel.type === 'dm')
				{
					var richEmbed = 
					{
					  "embed": {
						"title": "Direct Message Channels",
						"description": "<@" + client.user.id + "> is always enabled for direct message channels, and will respond to all messages by default. Enabling is not necessary.",
						//"color": 65280, //green
						"color": 13621503, //icy white
						"thumbnail": {
							"url": "https://cdn.discordapp.com/attachments/398641708319113226/443818626156462114/embed_thumbnail.png"
						}
					  }
					}
				
					message.channel.send(richEmbed);
				}
				else
				{
					if (memory.whitelist.indexOf(channelID) === -1)
					{
						memory.whitelist.push(channelID);
						syncMemory();
					}
					
					console.log("This bot has been enabled for a new channel!".system);
					console.log("\tGuild Name:   ".system + guildName);
					console.log("\tChannel Name: ".system + channelName);
					
					//sendMessage(message.channel, "<@!" + client.user.id + "> is now enabled for " + message.channel, false); 
					
					var richEmbed = 
					{
					  "embed": {
						"title": client.user.username + " Enabled for \"" + channelName + "\"",
						"description": "You have enabled <@" + client.user.id + "> for <#" + channelID + ">. This means that <@" + client.user.id + "> will respond to all future messages sent in <#" + channelID + ">.",
						"color": 65280, //green
						//"color": 13621503, //icy white
						"thumbnail": {
							"url": "https://cdn.discordapp.com/attachments/398641708319113226/443818626156462114/embed_thumbnail.png"
						},
						"fields": [
						  {
							"name": "Disabling",
							"value": "If you wish for <@" + client.user.id + "> to stop responding to messages in <#" + channelID + "> in the future, send any one of these commands:\n*@" + client.user.tag + " !disable*\n*@" + client.user.tag + " !unwhitelist*\n*@" + client.user.tag + " !unallow*"
						  }
						]
					  }
					}
				
					message.channel.send(richEmbed);
				}
			}
			else if (cmd === "unwhitelist" || cmd === "disable" || cmd === "unallow") //UNWHITELIST
			{
				if (message.channel.type === 'dm')
				{
					var richEmbed = 
					{
					  "embed": {
						"title": "Direct Message Channels",
						"description": "<@" + client.user.id + "> is always enabled for direct message channels, and will respond to all messages by default. Disabling is not possible.",
						//"color": 65280, //green
						"color": 13621503, //icy white
						"thumbnail": {
							"url": "https://cdn.discordapp.com/attachments/398641708319113226/443818626156462114/embed_thumbnail.png"
						}
					  }
					}
				
					message.channel.send(richEmbed);
				}
				else
				{
					var index = memory.whitelist.indexOf(message.channel.id);
					if (index !== -1)
					{
						memory.whitelist.splice(index, 1);
						syncMemory();
					}
					
					console.log("\n");
					console.log("This bot has been disabled on a channel.".system);
					console.log("\tGuild Name:   ".system + guildName);
					console.log("\tChannel Name: ".system + channelName);
					
					//sendMessage(message.channel, "<@!" + client.user.id + "> is now disabled for " + message.channel, false);
				
					var richEmbed = 
					{
					  "embed": {
						"title": client.user.username + " Disabled for \"" + channelName + "\"",
						"description": "You have disabled <@" + client.user.id + "> for <#" + channelID + ">. This means that <@" + client.user.id + "> will no longer respond to future messages sent in <#" + channelID + ">.",
						"color": 16711680, //red
						//"color": 13621503, //icy white
						"thumbnail": {
							"url": "https://cdn.discordapp.com/attachments/398641708319113226/443818626156462114/embed_thumbnail.png"
						},
						"fields": [
						  {
							"name": "Enabling",
							"value": "If you wish for <@" + client.user.id + "> to start responding to messages in <#" + channelID + "> in the future, send any one of these commands:\n*@" + client.user.tag + " !enable*\n*@" + client.user.tag + " !whitelist*\n*@" + client.user.tag + " !allow*"
						  }
						]
					  }
					}
				
					message.channel.send(richEmbed);
				}
			}
			
			return;
		}
	}
	
	if (isWhitelisted(message.channel.id) || isAMention(message.content) || message.channel.type === 'dm') //can respond
	{
		if (message.cleanContent.split(" ")[0] !== ">") //special ignore code
		{
			generateAndRespond(message);
		}			
	}
});

var isAMention = function(message){
	return (message.includes("<@!" + client.user.id + ">") || message.includes("<@" + client.user.id + ">"));
}

var removeMention = function(message) {
	message = message.replace("<@!" + client.user.id + ">", "");
	message = message.replace("<@" + client.user.id + ">", "");
	return message;
}

var isWhitelisted = function(channel) {	
	for (var i = 0; i < memory.whitelist.length; i++)
	{
		if (memory.whitelist[i] === channel) return true;
	}
	return false;
}

var formatResponse = function(response){
	response = response.replace(":)", ":slight_smile:");
	response = response.replace("(:", ":upside_down:");
	
	response = response.replace(";)", ":wink:");
	response = response.replace("(;", ":wink:");
	
	response = response.replace("):", ":slight_frown:");
	response = response.replace(":(", ":slight_frown:");
	
	response = response.replace(":O", ":open_mouth:");
	
	response = response.replace(":\\", ":confused:");
	response = response.replace(":/", ":confused:");
	
	response = response.replace(":'(", ":cry:");
	
	response = response.replace(":$", ":confused:");
	
	response = response.replace("XD", ":stuck_out_tongue_closed_eyes:");
	
	response = response.replace("♥", ":heart:");
	response = response.replace("❤", ":heart:");
	response = response.replace("❥", ":heart:");
	
	return response;
}

var syncMemory = function() {
	fs.writeFileSync(filePath + 'memory.json', JSON.stringify(memory)); 
}

var generateAndRespond = function(message) {
	//debug info
	var guildName;
	var guildID;
	var channelName;
	var channelID = message.channel.id;
	var authorTag = message.author.tag;;
	var authorID = message.author.id;
	var authorBot = message.author.bot;
	if (message.channel.type === 'dm')
	{
		guildName = "Direct Message";
		guildID = "NA";
		channelName = message.channel.recipient.tag; 
	}
	else if (message.channel.type === 'text')
	{
		guildName = message.channel.guild.name;
		guildID = message.channel.guild.id;
		channelName = message.channel.name;
	}
	
	//already thinking
	if (alreadyThinking[message.channel.id.toString()])
	{
		console.log("\n");
		console.log("Message: ".system + message.cleanContent);
		console.log("\tAuthor:  ".system + authorTag + " (".system + authorID + ")".system);
		console.log("\tBot:     ".system + authorBot);
		console.log("\tGuild:   ".system + guildName + " (".system + guildID + ")".system);
		console.log("\tChannel: ".system + channelName + " (".system + channelID + ")".system);
		console.log("Response: ".system + "[ignoring because already thinking]");
		return;
	}
	alreadyThinking[message.channel.id.toString()] = true;
	
	//generate response
	ai.setNick(message.channel.id.toString());
				
	ai.create(function (err, session) {
		ai.ask(message.cleanContent, function (err, response) {
			if (err) 
			{
				console.log("Error generating response: ".error + response);
				console.log("Response canceled.".system);
				return;
			}
			
			response = formatResponse(response);
				
			console.log("\n");
			console.log("Message: ".system + message.cleanContent);
			console.log("\tAuthor:  ".system + authorTag + " (".system + authorID + ")".system);
			console.log("\tBot:     ".system + authorBot);
			console.log("\tGuild:   ".system + guildName + " (".system + guildID + ")".system);
			console.log("\tChannel: ".system + channelName + " (".system + channelID + ")".system);
			console.log("Response: ".system + response);
				
			sendMessage(message.channel, response, true);
			
			alreadyThinking[message.channel.id.toString()] = false;
		});	
	});
}

var sendMessage = function(channel, content, simTyping) {
	if (simTyping === undefined) simTyping = false;
	
	if (simTyping)
	{
		var timeTypeSec = content.length / typingSpeed ;
		
		channel.startTyping();
		setTimeout(
			function() { 
				channel.stopTyping(); 
				channel.send(content).then(message => console.log("Sent message: ".system + message.content)).catch(sendingMessageError);;
			}, 
			timeTypeSec * 1000
		);
	}
	else
	{
		channel.send(content);
	}
}

var sendingMessageError = function(err, res) {
	if (err != null) console.error('\tERROR: could not send message\n\terr = [' + err + '], res = [' + res + ']');
}

connect();