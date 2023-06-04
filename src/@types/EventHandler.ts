import type { Awaitable, ClientEvents } from "discord.js";

import { error } from "../logger.js";

/**
 * // TODO
 */
type EventExecution<K extends keyof ClientEvents> = (...args: ClientEvents[K]) => Awaitable<void>;

/**
 * // TODO
 */
export class EventHandler<K extends keyof ClientEvents = keyof ClientEvents> {
	public readonly name: K;
	public readonly once: boolean = false;

	private execution?: EventExecution<K>;

	public constructor (name: K) {
		this.name = name;
	}

	// Unnecessary, since the name is set when the type is set in the constructor
	//
	// public setName (name: K): this {
	// 	Reflect.set(this, "name", name);
	// 	return this;
	// }

	public setOnce (once: boolean): this {
		Reflect.set(this, "once", once);
		return this;
	}

	public setExecution (execution: EventExecution<K>): this {
		this.execution = execution;
		return this;
	}

	public async execute (...args: ClientEvents[K]): Promise<void> {
		if (this.execution) {
			try {
				await this.execution(...args);
			}
			catch (err) {
				error(err);
			}
		}
	}
}
