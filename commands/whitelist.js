const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription('Allows me to respond to messages in this channel'),

	async execute(interaction) {
		// const userMention = '<@' + interaction.client.user.id + '>';
		const channelMention = '<#' + interaction.channel.id + '>';
		const hexIcyWhite = 0xCFD8FF;
		const hexGreen = 0x00FF00;

		const successEmbed = {
			title: 'Whitelisted',
			description: 'You have enabled me for ' + channelMention + '. This means that I will respond to all future messages sent in ' + channelMention + '.',
			color: hexGreen,
			fields: [
				{
					name: 'Disabling',
					value: 'If you wish for me to stop responding to messages in ' + channelMention + ' in the future, use the **/unwhitelist** command.',
				},
			],
		};
		const redundantEmbed = {
			title: 'Already Whitelisted',
			description: 'You have already enabled me for ' + channelMention + '.',
			color: hexIcyWhite,
		};

		if (interaction.extraInfo.addToWhitelist(interaction.channel)) {
			interaction.reply({ embeds: [successEmbed] });
		}
		else {
			interaction.reply({ embeds: [redundantEmbed] });
		}
	},
};