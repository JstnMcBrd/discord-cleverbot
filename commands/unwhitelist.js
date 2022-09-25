const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { embedColors } = require('../parameters.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unwhitelist')
		.setDescription('Disallows me from responding to messages in this channel'),

	async execute(interaction) {
		// const userMention = `<@${interaction.client.user.id}>`;
		const channelMention = `<#${interaction.channel.id}>`;

		const successEmbed = new EmbedBuilder()
			.setColor(embedColors.unwhitelist)
			.setTitle('Unwhitelisted')
			.setDescription(`You have disabled me for ${channelMention}. This means that I will no longer respond to future messages sent in ${channelMention}.`)
			.addFields(
				{ name: 'Enabling', value: `If you wish for me to start responding to messages in ${channelMention} in the future, use the **/whitelist** command.` },
			);

		const redundantEmbed = new EmbedBuilder()
			.setColor(embedColors.info)
			.setTitle('Already Unwhitelisted')
			.setDescription(`You have already disabled me for ${channelMention}.`);

		if (interaction.client.whitelist.removeChannel(interaction.channel)) {
			await interaction.reply({ embeds: [successEmbed] });
		}
		else {
			await interaction.reply({ embeds: [redundantEmbed] });
		}
	},
};