const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hexIcyWhite = 0xCFD8FF;
const hexRed = 0xFF0000;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unwhitelist')
		.setDescription('Disallows me from responding to messages in this channel'),

	async execute(interaction) {
		// const userMention = '<@' + interaction.client.user.id + '>';
		const channelMention = '<#' + interaction.channel.id + '>';

		const successEmbed = new EmbedBuilder()
			.setColor(hexRed)
			.setTitle('Unwhitelisted')
			.setDescription('You have disabled me for ' + channelMention + '. This means that I will no longer respond to future messages sent in ' + channelMention + '.')
			.addFields(
				{ name: 'Enabling', value: 'If you wish for me to start responding to messages in ' + channelMention + ' in the future, use the **/whitelist** command.' },
			);

		const redundantEmbed = new EmbedBuilder()
			.setColor(hexIcyWhite)
			.setTitle('Already Unwhitelisted')
			.setDescription('You have already disabled me for ' + channelMention + '.');

		if (interaction.extraInfo.removeFromWhitelist(interaction.channel)) {
			await interaction.reply({ embeds: [successEmbed] });
		}
		else {
			await interaction.reply({ embeds: [redundantEmbed] });
		}
	},
};