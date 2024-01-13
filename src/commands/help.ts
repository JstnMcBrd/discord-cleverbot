import { EmbedBuilder, userMention } from 'discord.js';
import type { ClientUser } from 'discord.js';

import { CommandHandler } from './CommandHandler.js';
import { invite } from './invite.js';
import { whitelist } from './whitelist.js';
import { unwhitelist } from './unwhitelist.js';
import { lastUpdated, embedColors, version } from '../parameters.js';

/** A command that gives the user a simple guide about the bot. */
export const help = new CommandHandler()
	.setName('help')
	.setDescription('Print a simple guide about me')
	.setExecution(async (interaction) => {
		const embed = createHelpEmbed(interaction.client.user);
		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	});

/**
 * @param user The current logged-in user
 * @returns An embed that provides a simple guide about the bot for the user
 */
function createHelpEmbed(user: ClientUser): EmbedBuilder {
	const mention = userMention(user.id);
	const avatarURL = user.avatarURL();
	return new EmbedBuilder()
		.setColor(embedColors.info)
		.setTitle('User Guide')
		.setDescription(`Hello! I am ${mention}, a chat bot for Discord. I respond to your messages using artifical intelligence from the [Cleverbot](https://www.cleverbot.com/) API.`)
		.setFields(
			{ name: 'Whitelisting', value: `By default, I will not respond to any messages in any channels to avoid spam. Use the ${whitelist.getMention()} command in a channel to allow me to talk there. After that, I will respond to every message sent in that channel.` },
			{ name: 'Unwhitelisting', value: `If you would like me to stop responding to messages in a whitelisted channel, use the ${unwhitelist.getMention()} command there. After that, I won't respond to any messages until you whitelist the channel again.` },
			{ name: 'Mentioning', value: `If you would like me to reply to a single message, just include ${mention} in your message. I will always respond, even in unwhitelisted channels.` },
			{ name: 'Ignoring', value: 'If you would like me to ignore a message in a whitelisted channel, begin the message with `"> "`. I will pretend I never saw it. You can use this to talk about me behind my back or laugh with your friends about something I said.' },
			{ name: 'Adding to Other Servers', value: `Use the ${invite.getMention()} command to invite me to another server.` },
		)
		.setFooter({
			text: `Version ${version}\nLast Updated`,
			iconURL: avatarURL ?? undefined,
		})
		.setTimestamp(lastUpdated);
}
