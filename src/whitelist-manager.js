/*
 * Whitelist Manager
 *
 * The whitelist is the list of channels that the bot is allowed to speak in.
 * This global manager takes care of...
 * - loading the whitelist from memory
 * - adding and removing channels
 * - saving the whitelist to memory
*/

/**
 * Dependencies
 */
const fs = require('node:fs');

/**
 * The file path of the whitelist memory file
 * @type {string}
 * @private
 */
let filePath = '';

/**
 * The local copy of the whitelist
 * @type {Array}
 * @private
 */
let whitelist = [];

/**
 * Loads the whitelist from memory file
 * @private
 */
const load = function() {
	whitelist = JSON.parse(fs.readFileSync(filePath));
};

/**
 * Verifies that all the channel IDs in the whitelist are accessable and removes invalid channels
 * Important: the client passed to this method must be logged in to the account that the whitelist is for
 * @param {Client} client a logged-in Discord client to use to access channels
 * @public
 */
const verify = async function(client) {
	for (const channelID of whitelist) {
		// Verify the channel exists / is accessible
		await client.channels.fetch(channelID).catch(error => {
			// If the channel doesn't exist, remove it from the whitelist
			if (error.message === 'Unknown Channel' || error.message === 'Missing Access') {
				removeChannel(channelID);
			}
			// If there's some other kind of error, throw a fit
			else {
				throw error;
			}
		});
	}
};

/**
 * Writes the whitelist to memory file
 * @private
 */
const save = function() {
	fs.writeFileSync(filePath, JSON.stringify(whitelist));
};

/**
 * Sets the account name so the memory file can be loaded
 * Should be called before trying to use the whitelist
 * Assumes the account name is valid
 * @param {string} account a valid account name
 * @public
 */
const setAccount = function(account) {
	filePath = `../accounts/${account}/whitelist.json`;
	load();
};

/**
 * Returns the local copy of the whitelist
 * @returns the whitelist
 * @public
 */
const getWhitelist = function() {
	return whitelist;
};

/**
 * Used by other methods to standardize their input so they can accept discord.js channels or string channel IDs
 * @param {string|Channel} channel Either a discord.js channel or the channel ID
 * @returns the channel ID
 * @private
 */
const getChannelID = function(channel) {
	// Will work with a channel object or just a channel ID
	return (channel.id) ? channel.id : channel;
};

/**
 * Adds a channel to the whitelist and saves to memory file
 * @param {string|Channel} channel Either a discord.js channel or the channel ID
 * @returns true if successful, false if the channel was already in the whitelist
 * @public
 */
const addChannel = function(channel) {
	// Standardize the input
	const channelID = getChannelID(channel);

	// If the channel is not already in the whitelist, add it
	if (!hasChannel(channelID)) {
		whitelist.push(channelID);
		save();
		return true;
	}
	return false;
};

/**
 * Removes a channel from the whitelist and saves to memory file
 * @param {string|Channel} channel Either a discord.js channel or the channel ID
 * @returns true if successful, false if the whitelist doesn't have the channel
 * @public
 */
const removeChannel = function(channel) {
	// Standardize the input
	const channelID = getChannelID(channel);

	// If the channel is in the whitelist, remove it
	if (hasChannel(channelID)) {
		whitelist.splice(whitelist.indexOf(channelID), 1);
		save();
		return true;
	}
	return false;
};

/**
 * Checks if a channel is in the whitelist
 * @param {string|Channel} channel Either a discord.js channel or the channel ID
 * @returns true if the channel is in the whitelist, false if not
 * @public
 */
const hasChannel = function(channel) {
	// Standardize the input
	const channelID = getChannelID(channel);

	return whitelist.indexOf(channelID) !== -1;
};

// Export public methods
// Alternative names are provided - may be more intuitive in certain situations
module.exports = {
	setAccount: setAccount,
	setWhitelistAccount: setAccount,

	verify: verify,
	verifyWhitelist: verify,

	getWhitelist: getWhitelist,

	addChannel: addChannel,
	whitelistChannel: addChannel,

	removeChannel: removeChannel,
	unwhitelistChannel: removeChannel,

	hasChannel: hasChannel,
	isWhitelisted: hasChannel,
};