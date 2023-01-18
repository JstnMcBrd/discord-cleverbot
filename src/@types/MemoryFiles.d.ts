/**
 * These types define the format of the JSON memory files that should be stored in the account directory for the bot.
 */

/**
 * The format of the config JSON file.
 * See an example in [accounts/ExampleUsername/config.json](../../accounts/ExampleUsername/config.json).
 */
export type Config = {
	clientId: string;
	token: string;
	url: string;
};

/**
 * The format of the whitelist JSON file.
 * See an example in [accounts/ExampleUsername/whitelist.json](../../accounts/ExampleUsername/whitelist.json).
 */
declare type Whitelist = Array<string>;
