import type { Awaitable, ClientEvents } from "discord.js";

export interface EventHandler<K extends keyof ClientEvents = keyof ClientEvents> {
	readonly name: K;
	readonly once: boolean;
	readonly execute: (...args: ClientEvents[K]) => Awaitable<void>;
}
