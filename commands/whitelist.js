const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription('Allows me to respond to messages in this channel'),
		
	async execute(interaction) {
		var userMention = "<@"+interaction.client.user.id+">";
		var channelMention = "<#"+interaction.channel.id+">";
		var successEmbed = {
			title: "Whitelisted",
			description: "You have enabled me for " + channelMention + ". This means that I will respond to all future messages sent in " + channelMention + ".",
			color: 65280, //green
			fields: [
				{
					name: "Disabling",
					value: "If you wish for me to stop responding to messages in " + channelMention + " in the future, use the **/unwhitelist** command."
				}
			]
		}
		var redundantEmbed = {
			title: "Already Whitelisted",
			description: "You have already enabled me for " + channelMention + ".",
			color: 13621503 //icy white
		}
		
		if (interaction.extraInfo.addToWhitelist(interaction.channel)) {
			interaction.reply({embeds: [successEmbed]});
		}
		else {
			interaction.reply({embeds: [redundantEmbed]});
		}
	},
};