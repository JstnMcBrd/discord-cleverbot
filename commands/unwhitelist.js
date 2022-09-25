const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unwhitelist')
		.setDescription('Disallows me from responding to messages in this channel'),

	async execute(interaction) {
		// const userMention = '<@' + interaction.client.user.id + '>';
		const channelMention = '<#' + interaction.channel.id + '>';
		const hexIcyWhite = 0xCFD8FF;
		const hexRed = 0xFF0000;

		const successEmbed = {
			title: 'Unwhitelisted',
			description: 'You have disabled me for ' + channelMention + '. This means that I will no longer respond to future messages sent in ' + channelMention + '.',
			color: hexRed,
			fields: [
				{
					name: 'Enabling',
					value: 'If you wish for me to start responding to messages in ' + channelMention + ' in the future, use the **/whitelist** command.',
				},
			],
		};
		const redundantEmbed = {
			title: 'Already Unwhitelisted',
			description: 'You have already disabled me for ' + channelMention + '.',
			color: hexIcyWhite,
		};

		if (interaction.extraInfo.removeFromWhitelist(interaction.channel)) {
			await interaction.reply({ embeds: [successEmbed] });
		}
		else {
			await interaction.reply({ embeds: [redundantEmbed] });
		}
	},
};