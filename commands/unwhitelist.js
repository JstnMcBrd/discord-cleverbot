const fs = require('node:fs');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unwhitelist')
		.setDescription('Disallows me from responding to messages in this channel'),
		
	async execute(interaction) {
		var userMention = "<@"+interaction.client.user.id+">";
		var channelMention = "<#"+interaction.channel.id+">";
		var successEmbed = {
			title: "Unwhitelisted",
			description: "You have disabled me for " + channelMention + ". This means that I will no longer respond to future messages sent in " + channelMention + ".",
			color: 16711680, //red
			fields: [
				{
					name: "Enabling",
					value: "If you wish for me to start responding to messages in " + channelMention + " in the future, use the **/whitelist** command."
				}
			]
		}
		var redundantEmbed = {
			title: "Already Unwhitelisted",
			description: "You have already disabled me for " + channelMention + ".",
			color: 13621503 //icy white
		}
		
		if (interaction.extraInfo.removeFromWhitelist(interaction.channel)) {
			interaction.reply({embeds: [successEmbed]});
		}
		else {
			interaction.reply({embeds: [redundantEmbed]});
		}
	},
};