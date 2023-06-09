import { EmbedBuilder, channelMention } from "discord.js";

import { CommandHandler } from "./CommandHandler.js";
import { generateContext } from "../memory/context.js";
import { addChannel as whitelistChannel } from "../memory/whitelist.js";
import { embedColors } from "../parameters.js";

/** A command that adds a channel to the whitelist. */
export const whitelist = new CommandHandler()
	.setName("whitelist")
	.setDescription("Allow me to respond to messages in this channel")
	.setExecution(async interaction => {
		if (interaction.channel === null) {
			throw new TypeError("Channel cannot be null.");
		}

		let embed: EmbedBuilder;
		let ephemeral: boolean;
		if (whitelistChannel(interaction.channel)) {
			await generateContext(interaction.channel, interaction.client);
			embed = createSuccessEmbed(interaction.channel.id);
			ephemeral = false;
		}
		else {
			embed = createRedundantEmbed(interaction.channel.id);
			ephemeral = true;
		}
		await interaction.reply({
			embeds: [embed],
			ephemeral,
		});
	});

/**
 * @param channelID The ID of the channel that was whitelisted
 * @returns An embed that says the channel was whitelisted
 */
function createSuccessEmbed (channelID: string): EmbedBuilder {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.whitelist)
		.setTitle("Whitelisted")
		.setDescription(`You have enabled me for ${mention}. This means that I will respond to all future messages sent in ${mention}.`)
		.addFields(
			{ name: "Disabling", value: `If you wish for me to stop responding to messages in ${mention} in the future, use the **/unwhitelist** command.` },
		);
}

/**
 * @param channelID The ID of the channel that was not whitelisted
 * @returns An embed that says the channel was already whitelisted
 */
function createRedundantEmbed (channelID: string): EmbedBuilder {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.info)
		.setTitle("Already Whitelisted")
		.setDescription(`You have already enabled me for ${mention}.`);
}
