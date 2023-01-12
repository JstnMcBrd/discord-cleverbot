/*
 * Message Helper
 *
 * This script contains useful functions for analyzing messages.
*/

/**
 * Recognizes when a message is prepended with '> ', which tells the bot not to respond
 * @param {Message} message the message to parse
 * @returns true if the message begins with '> ', false if otherwise
 * @public
 */
const isMarkedAsIgnore = function(message) {
	return message.cleanContent.substring(0, 2) === '> ';
};

/**
 * Recognizes when a message is from the specified user
 * @param {Message} message the message whose author to check
 * @param {User} user the user to check if the message came from
 * @returns true if the message came from the user, false if otherwise
 * @public
 */
const isFromUser = function(message, user) {
	return message.author.id === user.id;
};

/**
 * Recognizes when a message is empty (mostly likely an image)
 * @param {Message} message the message to check
 * @returns true if the message has no text content, false if otherwise
 * @public
 */
const isEmpty = function(message) {
	return message.cleanContent === '';
};

/**
 * Recognizes when a message @ mentions the specified user
 * @param {Message} message the message to check
 * @param {User} user the user to see if the message mentions
 * @returns true if the message mentions the user, else if otherwise
 * @public
 */
const isAMention = function(message, user) {
	return message.mentions.has(user);
};

// Export public methods
module.exports = {
	isMarkedAsIgnore: isMarkedAsIgnore,
	isFromUser: isFromUser,
	isEmpty: isEmpty,
	isAMention: isAMention,
};