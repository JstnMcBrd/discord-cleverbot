const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { embedColors } = require('../parameters.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription('Allows me to respond to messages in this channel'),

	async execute(interaction) {
		// const userMention = `<@${interaction.client.user.id}>`;
		const channelMention = `<#${interaction.channel.id}>`;

		const successEmbed = new EmbedBuilder()
			.setColor(embedColors.whitelist)
			.setTitle('Whitelisted')
			.setDescription(`You have enabled me for ${channelMention}. This means that I will respond to all future messages sent in ${channelMention}.`)
			.addFields(
				{ name: 'Disabling', value: `If you wish for me to stop responding to messages in ${channelMention} in the future, use the **/unwhitelist** command.` },
			);

		const redundantEmbed = new EmbedBuilder()
			.setColor(embedColors.info)
			.setTitle('Already Whitelisted')
			.setDescription(`You have already enabled me for ${channelMention}.`);

		if (interaction.client.whitelist.addChannel(interaction.channel)) {
			await interaction.reply({ embeds: [successEmbed] });
		}
		else {
			await interaction.reply({ embeds: [redundantEmbed] });
		}
	},
};