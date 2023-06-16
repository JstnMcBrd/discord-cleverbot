import type { Client } from "discord.js";
import { error } from "./logger.js";

/** How long to wait before retrying a failed Discord API connection attempt (in seconds). */
const connectionRetryWait = 10;

/**
 * Connects the given Client to the Discord API, and retries if it fails.
 *
 * @param client The Client to log in
 * @param authToken The authorization to use to log in
 */
export async function connect (client: Client, authToken: string): Promise<void> {
	try {
		await client.login(authToken);
	}
	catch (err) {
		error(err);
		setTimeout(() => void connect(client, authToken), connectionRetryWait * 1000);
	}
}
