import { EmbedBuilder, channelMention } from 'discord.js';

import { CommandHandler } from './CommandHandler.js';
import { whitelist } from './whitelist.js';
import { deleteContext } from '../memory/context.js';
import { removeChannel } from '../memory/whitelist.js';
import { embedColors } from '../parameters.js';

/** A command that removes a channel from the whitelist. */
export const unwhitelist = new CommandHandler()
	.setName('unwhitelist')
	.setDescription('Disallow me from responding to messages in this channel')
	.setExecution(async (interaction) => {
		if (interaction.channel === null) {
			throw new TypeError('Channel cannot be null.');
		}

		let embed: EmbedBuilder;
		let ephemeral: boolean;
		if (removeChannel(interaction.channel)) {
			deleteContext(interaction.channel);
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
 * @param channelID The ID of the channel that was unwhitelisted
 * @returns An embed that says the channel was unwhitelisted
 */
function createSuccessEmbed(channelID: string): EmbedBuilder {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.unwhitelist)
		.setTitle('Unwhitelisted')
		.setDescription(`You have disabled me for ${mention}. This means that I will no longer respond to future messages sent in this channel.`)
		.addFields(
			{ name: 'Enabling', value: `If you want me to start responding to messages here, you can use the ${whitelist.getMention()} command.` },
		);
}

/**
 * @param channelID The ID of the channel that was not unwhitelisted
 * @returns An embed that says the channel was already not whitelisted
 */
function createRedundantEmbed(channelID: string): EmbedBuilder {
	const mention = channelMention(channelID);
	return new EmbedBuilder()
		.setColor(embedColors.info)
		.setTitle('Already Unwhitelisted')
		.setDescription(`You have already disabled me for ${mention}.`);
}
