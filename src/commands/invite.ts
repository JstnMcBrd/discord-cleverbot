import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import type { ClientUser } from 'discord.js';

import { CommandHandler } from './CommandHandler.js';
import { embedColors } from '../parameters.js';

/** A command that allows the user to invite the bot to a new server. */
export const invite = new CommandHandler()
	.setName('invite')
	.setDescription('Add me to a new server')
	.setExecution(async (interaction) => {
		await interaction.client.application.fetch();
		const isPublic = interaction.client.application.botPublic;

		const embed = isPublic ? undefined : createDisabledEmbed();

		const button = createInviteButton(interaction.client.user, !isPublic);
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(button);

		await interaction.reply({
			...(embed && { embeds: [embed] }),
			components: [row],
			ephemeral: true,
		});
	});

/**
 * @returns An embed that informs the user that the invite feature is disabled
 */
function createDisabledEmbed(): EmbedBuilder {
	return new EmbedBuilder()
		.setColor(embedColors.error)
		.setDescription('I am not a public bot, so this feature is disabled for now. Please ask my developer if you would like to add me to your server.');
}

/**
 * @param user The user account of the bot
 * @param disabled Whether the button should be disabled
 * @returns A button that invites the bot to a new server
 */
function createInviteButton(user: ClientUser, disabled = false): ButtonBuilder {
	const inviteLink = createInviteLink(user);
	return new ButtonBuilder()
		.setLabel('Add to Server')
		.setURL(inviteLink)
		.setStyle(ButtonStyle.Link)
		.setDisabled(disabled);
}

/**
 * @param user The user account of the bot
 * @returns An invite link to add the bot to a new server with proper permissions
 */
function createInviteLink(user: ClientUser): string {
	return `https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=274877975552&scope=bot%20applications.commands`;
}
