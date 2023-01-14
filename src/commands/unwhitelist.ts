import { EmbedBuilder, channelMention } from "discord.js";

import { CommandHandler } from "../@types/CommandHandler";
import { embedColors } from "../parameters";
import { removeChannel as unwhitelistChannel } from "../whitelistManager";

export const unwhitelist = new CommandHandler()
	.setName("unwhitelist")
	.setDescription("Disallows me from responding to messages in this channel")
	.setExecution(async interaction => {
		if (interaction.channel === null) {
			throw new TypeError("Channel cannot be null");
		}

		let embed = {};
		if (unwhitelistChannel(interaction.channel)) {
			embed = createSuccessEmbed(interaction.channel.id);
		}
		else {
			embed = createRedundantEmbed(interaction.channel.id);
		}
		await interaction.reply({ embeds: [embed] });
	});

function createSuccessEmbed(channelID: string): EmbedBuilder {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.unwhitelist)
		.setTitle("Unwhitelisted")
		.setDescription(`You have disabled me for ${mention}. This means that I will no longer respond to future messages sent in ${mention}.`)
		.addFields(
			{ name: "Enabling", value: `If you wish for me to start responding to messages in ${mention} in the future, use the **/whitelist** command.` },
		);
}

function createRedundantEmbed(channelID: string): EmbedBuilder {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.info)
		.setTitle("Already Unwhitelisted")
		.setDescription(`You have already disabled me for ${mention}.`);
}