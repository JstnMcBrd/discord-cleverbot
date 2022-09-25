module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(client, interaction) {
		try {
			await onInteraction(client, interaction);
		}
		catch (error) {
			client.eventError('interactionCreate', error);
		}
	},
};

// Called whenever the discord.js client receives an interaction (usually means a slash command)
const onInteraction = async function(client, interaction) {
	// Ignore any interactions that are not commands
	if (!interaction.isChatInputCommand()) return;
	console.log('Received command interaction'.system);
	console.log(indent(debugInteraction(interaction), 1));

	// Ignore any commands that are not recognized
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	console.log('Command recognized'.system);

	// Execute the command script
	console.log('Executing command'.system);
	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error('\t', client.debugFormatError(error));
		console.error('Failed to execute command'.warning);
		console.log();
		client.sendErrorMessage(interaction, error);
		return;
	}
	console.log('Command executed successfully'.system);
	console.log();
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

// Indents strings that have more than one line
const indent = function(str, numTabs) {
	let tabs = '';
	while (numTabs > 0) {
		tabs += '\t';
		numTabs--;
	}
	return (tabs + str).replaceAll('\n', '\n' + tabs);
};