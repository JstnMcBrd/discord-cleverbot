import { EmbedBuilder, channelMention } from "discord.js";

import { CommandHandler } from "../@types/CommandHandler.js";
import { embedColors } from "../parameters.js";
import { addChannel as whitelistChannel } from "../memory/whitelist.js";
import { generateContext } from "../memory/context.js";

export const whitelist = new CommandHandler()
	.setName("whitelist")
	.setDescription("Allows me to respond to messages in this channel")
	.setExecution(async interaction => {
		if (interaction.channel === null) {
			throw new TypeError("Channel cannot be null");
		}

		let embed: EmbedBuilder;
		if (whitelistChannel(interaction.channel)) {
			await generateContext(interaction.channel, interaction.client);
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
		.setColor(embedColors.whitelist)
		.setTitle("Whitelisted")
		.setDescription(`You have enabled me for ${mention}. This means that I will respond to all future messages sent in ${mention}.`)
		.addFields(
			{ name: "Disabling", value: `If you wish for me to stop responding to messages in ${mention} in the future, use the **/unwhitelist** command.` },
		);
}

function createRedundantEmbed(channelID: string): EmbedBuilder {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.info)
		.setTitle("Already Whitelisted")
		.setDescription(`You have already enabled me for ${mention}.`);
}
