module.exports = {
	name: "interactionCreate",
	once: false,
	async execute(interaction) {
		try {
			await onInteraction(interaction);
		}
		catch (error) {
			eventError("interactionCreate", error);
		}
	},
};

const logger = require("../helpers/logger");
const { replyWithError } = require("../helpers/replyWithError");
const { eventError } = require("./");

// Called whenever the discord.js client receives an interaction (usually means a slash command)
const onInteraction = async function(interaction) {
	const client = interaction.client;

	// Ignore any interactions that are not commands
	if (!interaction.isChatInputCommand()) return;
	logger.info("Received command interaction");
	logger.debug(indent(debugInteraction(interaction), 1));

	// Ignore any commands that are not recognized
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	logger.info("Command recognized");

	// Execute the command script
	logger.info("Executing command");
	try {
		await command.execute(interaction);
	}
	catch (error) {
		logger.error(error);
		logger.warn("Failed to execute command");
		logger.log();
		replyWithError(interaction, error);
		return;
	}
	logger.info("Command executed successfully");
	logger.info();
};

// Formats important information about an interaction to a string
const debugInteraction = function(interaction) {
	let str = "INTERACTION";
	if (interaction.isChatInputCommand()) {
		str += "\nCommand: " + interaction.commandName;
	}
	str += "\nUser:    " + interaction.user.tag + " (" + interaction.user.id + ")";
	str += "\nChannel: " + interaction.channel.name + " (" + interaction.channel.id + ")";
	// Compensate for DMs
	if (interaction.guild !== null) {
		str += "\nGuild:   " + interaction.guild.name + " (" + interaction.guild.id + ")";
	}
	return str;
};

// Indents strings that have more than one line
const indent = function(str, numTabs) {
	let tabs = "";
	while (numTabs > 0) {
		tabs += "\t";
		numTabs--;
	}
	return (tabs + str).replaceAll("\n", "\n" + tabs);
};
