//https://discordapp.com/oauth2/authorize?&client_id=388857293657079820&scope=bot&permissions=0

//update to discord.js
//rewrite command system

var Discord = require('discord.io');
var logger = require('winston');
var cleverbot = require('cleverbot.io');
var fs = require('fs');
//var readline = require('readline');

var auth = require('./auth.json');
var memory = JSON.parse(fs.readFileSync('./memory.json'));

// Initialize Logger
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

var ai;
var thinking = false;

bot.on('ready', function (evt) {
    logger.info("Connected");
    logger.info("Logged in as: ");
    logger.info(bot.username + " - (" + bot.id + ")");

	ai = new cleverbot("anmD6hc04dkgPvcQ", "AGKiDOvTNnw4Dp7SMOssEcmsW9Fe1ws5");
	ai.setNick("Test")
	ai.create(function (err, session) {});
	
	bot.setPresence({game: {name: "cleverbot.io"}});
});

bot.on('disconnect', function(errMsg, code) {
	logger.error("Disconnected! >" + errMsg + " " + code);
	logger.error("Retrying connection"); //in 1 second");
	//setTimeout(function() {bot.connect()}, 1000);
	bot.connect();
});

bot.on('message', function (user, userID, channelID, message, evt) {	
	if (userID === bot.id) return;
	if (message === "") return;
	
	if (isAMention(message))
	{
		//console.log("Is a mention");
		
		var cmd = removeMention(message);
		cmd = cmd.toLowerCase();
		cmd = cmd.trim();
		if (cmd.charAt(0) === '!')
		{
			cmd = cmd.replace("!", "");
			if (cmd === "whitelist" || cmd === "enable" || cmd == "allow")
			{
				if (memory.whitelist.indexOf(channelID) === -1)
				{
					memory.whitelist.push(channelID);
					syncMemory();
				}
				
				sendMessage(channelID, "<@!" + bot.id + "> is now enabled for <#" + channelID + ">", false); 
			}
			else if (cmd === "unwhitelist" || cmd === "disable" || cmd === "unallow")
			{
				var index = memory.whitelist.indexOf(channelID);
				if (index !== -1)
				{
					memory.whitelist.splice(index, 1);
					syncMemory();
				}
				
				sendMessage(channelID, "<@!" + bot.id + "> is now disabled for <#" + channelID + ">", false); 
			}
			
			return;
		}
	}
	
	if (!isWhitelisted(channelID)) return;
	
	if (thinking)
	{
		console.log("\n");
		logger.info("Message: " + message);
		logger.info("Response: [ignoring because already thinking]");
		return;
	}
	thinking = true;
	
	ai.setNick(channelID.toString());
			
	ai.ask(message, function (err, response) {		
		response = formatResponse(response);
		
		console.log("\n");
		logger.info("Message: " + message);
		logger.info("Response: " + response);
		
		bot.sendMessage(
			{ to: channelID, message: response, typing: true }, 
			function(err, res) {
				if (err != null) logger.error('\tERROR: could not send message\n\terr = [' + err + '], res = [' + res + ']');
			}
		);
		
		thinking = false;
	});
	
});

var isAMention = function(message){
	return (message.includes("<@!" + bot.id + ">") || message.includes("<@" + bot.id + ">"));
}

var removeMention = function(message) {
	message = message.replace("<@!" + bot.id + ">", "");
	message = message.replace("<@" + bot.id + ">", "");
	return message;
}

var isWhitelisted = function(channelID) {	
	for (var i = 0; i < memory.whitelist.length; i++)
	{
		if (memory.whitelist[i] === channelID) return true;
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
	
	response = response.replace("XD", ":smile:");
	
	response = response.replace("♥", ":heart:");
	response = response.replace("❤", ":heart:");
	response = response.replace("❥", ":heart:");
	
	return response;
}

var syncMemory = function() {
	fs.writeFileSync('./memory.json', JSON.stringify(memory)); 
}

var sendMessage = function(channelID, toSend, simTyping) {
	if (simTyping === undefined) simTyping = false;
	
	logger.info('Sending message: [' + toSend + ']');
	bot.sendMessage(
		{ to: channelID, message: toSend, typing: simTyping}, 
		sendingMessageError
	);
}

var sendingMessageError = function(err, res) {
	if (err != null) logger.error('\tERROR: could not send message\n\terr = [' + err + '], res = [' + res + ']');
}