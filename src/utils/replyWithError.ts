import { ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock, EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction, Message } from 'discord.js';

import { embedColors, githubURL } from '../parameters.js';
import { error } from '../logger.js';

/**
 * Replies to a Discord message or interaction with an error message.
 *
 * @param message The message or interaction to reply to
 * @param internalError The error to send
 */
export async function replyWithError(message: Message | ChatInputCommandInteraction, internalError: unknown): Promise<void> {
	const stringifiedError = String(internalError);

	const embed = createErrorEmbed(stringifiedError);

	const button = createReportButton(stringifiedError);
	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(button);

	try {
		await message.reply({
			embeds: [embed],
			components: [row],
		});
	}
	catch (err) {
		error(err);
	}
}

/**
 * @returns An embed that displays the error message for the user
 */
function createErrorEmbed(stringifiedError: string): EmbedBuilder {
	return new EmbedBuilder()
		.setColor(embedColors.error)
		.setTitle('Error')
		.setDescription('I encountered an error while trying to respond. Please report this to my developer.')
		.setFields(
			{ name: 'Message', value: codeBlock(stringifiedError) },
		);
}

/**
 * @returns A button that links to a GitHub issue creation page with the error message
 */
function createReportButton(stringifiedError: string): ButtonBuilder {
	const date = new Date();
	const timestamp = `${date.toDateString()} ${date.toLocaleTimeString()}`;
	const issueURL = createGitHubIssueURL(
		githubURL,
		stringifiedError,
		`Timestamp: \`${timestamp}\``,
	);
	return new ButtonBuilder()
		.setLabel('Report')
		.setURL(issueURL.toString())
		.setStyle(ButtonStyle.Link);
}

/**
 * @returns A URL that links to a GitHub issue creation page with the given title and body
 */
function createGitHubIssueURL(repository: URL, title?: string, body?: string): URL {
	const url = new URL(repository);
	url.pathname += '/issues/new';
	url.searchParams.append('labels', 'bug');
	if (title) {
		url.searchParams.append('title', title);
	}
	if (body) {
		url.searchParams.append('body', body);
	}
	return url;
}
