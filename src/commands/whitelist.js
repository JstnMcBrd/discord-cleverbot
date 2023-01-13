const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { embedColors } = require("../parameters.js");
const { addChannel: whitelistChannel } = require("../whitelist-manager.js");

const channelMention = function(channelID) {
	return `<#${channelID}>`;
};

const createSuccessEmbed = function(channelID) {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.whitelist)
		.setTitle("Whitelisted")
		.setDescription(`You have enabled me for ${mention}. This means that I will respond to all future messages sent in ${mention}.`)
		.addFields(
			{ name: "Disabling", value: `If you wish for me to stop responding to messages in ${mention} in the future, use the **/unwhitelist** command.` },
		);
};

const createRedundantEmbed = function(channelID) {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.info)
		.setTitle("Already Whitelisted")
		.setDescription(`You have already enabled me for ${mention}.`);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName("whitelist")
		.setDescription("Allows me to respond to messages in this channel"),

	async execute(interaction) {
		let embed = {};
		if (whitelistChannel(interaction.channel)) {
			embed = createSuccessEmbed(interaction.channel.id);
		}
		else {
			embed = createRedundantEmbed(interaction.channel.id);
		}
		await interaction.reply({ embeds: [embed] });
	},
};
