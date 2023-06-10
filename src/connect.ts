import type { Client } from "discord.js";

/** How long to wait before retrying a failed Discord API connection attempt (in seconds). */
const connectionRetryWait = 10;

/**
 * Connects the client with the discord API
 *
 * @param authToken The authorization to use to log in
 */
export async function connect (client: Client, authToken: string): Promise<void> {
	try {
		await client.login(authToken);
	}
	catch (err) {
		// Use connect() function again
		setTimeout(() => void connect(client, authToken), connectionRetryWait * 1000);
	}
}
