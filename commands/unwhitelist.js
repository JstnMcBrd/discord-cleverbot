const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { embedColors } = require('../parameters.js');
const { unwhitelistChannel } = require('../whitelist-manager.js');

const channelMention = function(channelID) {
	return `<#${channelID}>`;
};

const createSuccessEmbed = function(channelID) {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.unwhitelist)
		.setTitle('Unwhitelisted')
		.setDescription(`You have disabled me for ${mention}. This means that I will no longer respond to future messages sent in ${mention}.`)
		.addFields(
			{ name: 'Enabling', value: `If you wish for me to start responding to messages in ${mention} in the future, use the **/whitelist** command.` },
		);
};

const createRedundantEmbed = function(channelID) {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.info)
		.setTitle('Already Unwhitelisted')
		.setDescription(`You have already disabled me for ${mention}.`);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unwhitelist')
		.setDescription('Disallows me from responding to messages in this channel'),

	async execute(interaction) {
		let embed = {};
		if (unwhitelistChannel(interaction.channel)) {
			embed = createSuccessEmbed(interaction.channel.id);
		}
		else {
			embed = createRedundantEmbed(interaction.channel.id);
		}
		await interaction.reply({ embeds: [embed] });
	},
};